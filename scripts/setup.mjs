#!/usr/bin/env node
/**
 * One-time project setup: pick AI platform, init OpenSpec, generate skill, write runtime.
 *
 * Usage:
 *   npm run setup -- --tool cursor
 *   npm run setup -- --detect --clean
 *   npm run setup -- --tool claude --skip-openspec
 */
import { existsSync, rmSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';
import readline from 'readline';
import {
  loadRegistry,
  generatePlatformSkills,
  platformRootDir,
} from './generate-platform-skills.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const registry = loadRegistry(root);

const PROTECTED_DIRS = new Set(['.agents', '.project']);

function parseArgs(argv) {
  const args = {
    tool: null,
    detect: false,
    clean: false,
    skipOpenspec: false,
    list: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--tool' && argv[i + 1]) args.tool = argv[++i];
    else if (a === '--detect') args.detect = true;
    else if (a === '--clean') args.clean = true;
    else if (a === '--skip-openspec') args.skipOpenspec = true;
    else if (a === '--list') args.list = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

function printHelp() {
  console.log(`
decomposition-pattern setup

  npm run setup -- --tool <id>     Configure one AI platform
  npm run setup -- --detect        Guess platform from environment
  npm run setup -- --clean         Remove other platform folders
  npm run setup -- --skip-openspec Skip "openspec init"
  npm run setup -- --list          List platform IDs

Examples:
  npm run setup -- --tool cursor --clean
  npm run setup -- --detect --clean
`);
}

function findTool(id) {
  const tool = registry.tools.find((t) => t.id === id);
  if (!tool) {
    console.error(`Unknown platform: "${id}"`);
    console.error('Run: npm run setup -- --list');
    process.exit(1);
  }
  return tool;
}

function detectPlatform() {
  if (process.env.CURSOR_AGENT || process.env.CURSOR_TRACE_ID) return 'cursor';
  if (process.env.CLAUDE_CODE || process.env.CLAUDECODE) return 'claude';
  if (process.env.WINDSURF_SESSION) return 'windsurf';

  const existing = registry.tools.filter((t) =>
    existsSync(join(root, t.skillsDir, 'build-product', 'SKILL.md')),
  );
  if (existing.length === 1) return existing[0].id;

  const withSkillsDir = registry.tools.filter((t) =>
    existsSync(join(root, platformRootDir(t.skillsDir))),
  );
  if (withSkillsDir.length === 1) return withSkillsDir[0].id;

  return null;
}

function promptPlatform() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log('\nSelect AI platform (OpenSpec tool ID):\n');
    registry.tools.forEach((t, i) => {
      console.log(`  ${String(i + 1).padStart(2)}. ${t.id.padEnd(16)} ${t.name}`);
    });
    console.log('');
    rl.question('Enter number or ID [cursor]: ', (answer) => {
      rl.close();
      const trimmed = (answer || 'cursor').trim();
      const num = parseInt(trimmed, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= registry.tools.length) {
        resolve(registry.tools[num - 1].id);
        return;
      }
      resolve(trimmed);
    });
  });
}

function cleanOtherPlatforms(activeToolId) {
  const activeTool = findTool(activeToolId);
  const activeRoot = platformRootDir(activeTool.skillsDir);
  let removed = 0;

  for (const tool of registry.tools) {
    if (tool.id === activeToolId) continue;

    // GitHub Copilot: skills live under .github/skills — keep workflows/ etc.
    if (tool.skillsDir.startsWith('.github/')) {
      const skillPath = join(root, tool.skillsDir, 'build-product');
      if (!existsSync(skillPath)) continue;
      rmSync(skillPath, { recursive: true, force: true });
      console.log(`  removed ${tool.skillsDir}/build-product/`);
      removed++;
      continue;
    }

    const dir = platformRootDir(tool.skillsDir);
    if (PROTECTED_DIRS.has(dir)) continue;
    if (dir === activeRoot) continue;
    const full = join(root, dir);
    if (!existsSync(full)) continue;
    rmSync(full, { recursive: true, force: true });
    console.log(`  removed ${dir}/`);
    removed++;
  }
  return removed;
}

function writeRuntimeJson(tool) {
  mkdirSync(join(root, '.project'), { recursive: true });
  const runtime = {
    platformId: tool.id,
    platformName: tool.name,
    delegation: tool.delegation,
    parallelAgents: tool.parallelAgents,
    commandSyntax: tool.commandSyntax,
    detected: false,
    configuredTools: [tool.id],
  };
  writeFileSync(
    join(root, '.project/runtime.json'),
    `${JSON.stringify(runtime, null, 2)}\n`,
  );
  console.log('  wrote .project/runtime.json');
}

function runOpenspecInit(toolId) {
  const result = spawnSync('openspec', ['init', '--tools', toolId], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error?.code === 'ENOENT') {
    console.warn('\n  openspec CLI not found — skip or: npm install -g @fission-ai/openspec');
    return false;
  }
  if (result.status !== 0) {
    console.warn('\n  openspec init exited with non-zero status (continuing setup)');
    return false;
  }
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    return;
  }

  if (args.list) {
    registry.tools.forEach((t) => console.log(`${t.id}\t${t.name}`));
    return;
  }

  let toolId = args.tool;

  if (!toolId && args.detect) {
    toolId = detectPlatform();
    if (toolId) console.log(`Detected platform: ${toolId}`);
  }

  if (!toolId) {
    toolId = await promptPlatform();
  }

  const tool = findTool(toolId);
  console.log(`\nSetup for: ${tool.name} (${tool.id})\n`);

  if (args.clean) {
    console.log('Cleaning other platform folders…');
    cleanOtherPlatforms(tool.id);
  }

  if (!args.skipOpenspec) {
    console.log('Running openspec init…');
    runOpenspecInit(tool.id);
  }

  console.log('Generating build-product skill…');
  generatePlatformSkills(root, [tool.id]);

  writeRuntimeJson(tool);

  console.log(`
Done. Next steps:
  1. Open this folder in ${tool.name}
  2. Invoke: /build-product <описание продукта>
`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
