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
    if (a.startsWith('--tool=')) args.tool = a.slice('--tool='.length);
    else if (a === '--tool' && argv[i + 1]) args.tool = argv[++i];
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

function findTool(registry, id) {
  const tool = registry.tools.find((t) => t.id === id);
  if (!tool) {
    console.error(`Unknown platform: "${id}"`);
    console.error('Run: npm run setup -- --list');
    process.exit(1);
  }
  return tool;
}

function readRuntimePlatformId() {
  const path = join(root, '.project/runtime.json');
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, 'utf8')).platformId || null;
  } catch {
    return null;
  }
}

function detectPlatform(registry) {
  if (process.env.CURSOR_AGENT || process.env.CURSOR_TRACE_ID) return 'cursor';
  if (process.env.CLAUDE_CODE || process.env.CLAUDECODE) return 'claude';
  if (process.env.WINDSURF_SESSION) return 'windsurf';

  const existing = registry.tools.filter((t) =>
    existsSync(join(root, t.skillsDir, 'build-product', 'SKILL.md')),
  );
  if (existing.length === 1) return existing[0].id;
  if (existing.length > 1) {
    console.warn(`Multiple platform skills found: ${existing.map((t) => t.id).join(', ')}`);
    console.warn('Pass --tool explicitly or use --clean after choosing one.');
  }

  const fromRuntime = readRuntimePlatformId();
  if (fromRuntime) return fromRuntime;

  return null;
}

function sortedTools(registry) {
  return [...registry.tools].sort((a, b) => a.id.localeCompare(b.id));
}

function promptPlatform(registry) {
  const tools = sortedTools(registry);
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    console.log('\nSelect AI platform (OpenSpec tool ID):\n');
    tools.forEach((t, i) => {
      console.log(`  ${String(i + 1).padStart(2)}. ${t.id.padEnd(16)} ${t.name}`);
    });
    console.log('');
    rl.question('Enter number or ID [cursor]: ', (answer) => {
      rl.close();
      const trimmed = (answer || 'cursor').trim();
      const num = parseInt(trimmed, 10);
      if (!Number.isNaN(num) && num >= 1 && num <= tools.length) {
        resolve(tools[num - 1].id);
        return;
      }
      resolve(trimmed);
    });
  });
}

function cleanOtherPlatforms(registry, activeToolId) {
  const activeTool = findTool(registry, activeToolId);
  const activeRoot = platformRootDir(activeTool.skillsDir);
  let removed = 0;

  for (const tool of registry.tools) {
    if (tool.id === activeToolId) continue;

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

function writeRuntimeJson(tool, detected) {
  mkdirSync(join(root, '.project'), { recursive: true });
  const runtime = {
    platformId: tool.id,
    platformName: tool.name,
    delegation: tool.delegation,
    parallelAgents: tool.parallelAgents,
    commandSyntax: tool.commandSyntax,
    detected,
    configuredTools: [tool.id],
  };
  writeFileSync(
    join(root, '.project/runtime.json'),
    `${JSON.stringify(runtime, null, 2)}\n`,
  );
  console.log('  wrote .project/runtime.json');
}

function resolveOpenspecBin() {
  const binName = process.platform === 'win32' ? 'openspec.cmd' : 'openspec';
  const local = join(root, 'node_modules', '.bin', binName);
  if (existsSync(local)) return local;
  return null;
}

function runOpenspecInit(toolId) {
  const bin = resolveOpenspecBin();
  if (!bin) {
    console.warn('\n  openspec not found — run: npm install');
    console.warn('  Then re-run setup or: npm run openspec -- init --tools', toolId);
    console.warn('  Using docs/ fallback for now.');
    return false;
  }
  const result = spawnSync(bin, ['init', '--tools', toolId], {
    cwd: root,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  if (result.error?.code === 'ENOENT') {
    console.warn('\n  openspec CLI not found — run: npm install');
    return false;
  }
  if (result.status !== 0) {
    console.warn('\n  openspec init failed — using docs/ fallback');
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

  const registry = loadRegistry(root);

  if (args.list) {
    sortedTools(registry).forEach((t) => console.log(`${t.id}\t${t.name}`));
    return;
  }

  let toolId = args.tool;
  let wasDetected = false;

  if (!toolId && args.detect) {
    toolId = detectPlatform(registry);
    if (toolId) {
      console.log(`Detected platform: ${toolId}`);
      wasDetected = true;
    }
  }

  if (!toolId && !process.stdin.isTTY) {
    console.error('Non-interactive mode: pass --tool <id> or --detect');
    console.error('Example: npm run setup -- --tool cursor --clean');
    process.exit(1);
  }

  if (!toolId) {
    toolId = await promptPlatform(registry);
  }

  const tool = findTool(registry, toolId);
  console.log(`\nSetup for: ${tool.name} (${tool.id})\n`);

  if (args.clean) {
    console.log('Cleaning other platform folders…');
    cleanOtherPlatforms(registry, tool.id);
  }

  if (!args.skipOpenspec) {
    console.log('Running openspec init…');
    runOpenspecInit(tool.id);
  }

  console.log('Generating build-product skill…');
  generatePlatformSkills(root, [tool.id]);

  writeRuntimeJson(tool, wasDetected);

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
