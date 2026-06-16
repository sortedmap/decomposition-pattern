#!/usr/bin/env node
/**
 * Generate build-product SKILL.md for selected OpenSpec platforms.
 * Usage: node scripts/generate-platform-skills.mjs [--tools cursor,claude]
 *        node scripts/generate-platform-skills.mjs  (reads .project/runtime.json)
 */
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadRegistry(projectRoot) {
  return JSON.parse(
    readFileSync(join(projectRoot, 'platforms/registry.json'), 'utf8'),
  );
}

const delegationFile = {
  'task-tool': 'task-tool.md',
  subagent: 'subagent.md',
  'slash-command': 'slash-command.md',
  'skill-only': 'skill-only.md',
};

function skillBody(tool) {
  const del = delegationFile[tool.delegation] || 'inline-role.md';
  if (!delegationFile[tool.delegation]) {
    console.warn(`  warn: unknown delegation "${tool.delegation}" for ${tool.id}, using inline-role.md`);
  }
  return `---
name: build-product
description: >-
  Orchestrates full product development from requirements to deployed microservices.
  Platform: ${tool.name} (${tool.id}). Runs 14 phases via specialized agents.
  Use when user invokes /build-product or asks to build a new product from scratch.
disable-model-invocation: true
---

# Build Product — ${tool.name}

**Platform ID:** \`${tool.id}\`  
**Delegation:** \`${tool.delegation}\`  
**Parallel agents:** ${tool.parallelAgents}

## Instructions

1. Load [build-product/SKILL.core.md](../../../build-product/SKILL.core.md)
2. Load [build-product/bootstrap.md](../../../build-product/bootstrap.md) if \`.project/runtime.json\` is missing
3. Load [platforms/delegation/${del}](../../../platforms/delegation/${del})
4. Verify \`.project/runtime.json\` → \`platformId: "${tool.id}"\`

All paths relative to repository root.
`;
}

/** @returns {string[]} paths written */
export function generatePlatformSkills(projectRoot, toolIds) {
  const registry = loadRegistry(projectRoot);
  const selected = new Set(toolIds);
  const written = [];
  const unknown = toolIds.filter((id) => !registry.tools.some((t) => t.id === id));

  if (unknown.length > 0) {
    console.error(`Unknown platform ID(s): ${unknown.join(', ')}`);
    console.error('Run: npm run setup -- --list');
    process.exit(1);
  }

  for (const tool of registry.tools) {
    if (!selected.has(tool.id)) continue;
    const dir = join(projectRoot, tool.skillsDir, 'build-product');
    mkdirSync(dir, { recursive: true });
    const path = join(dir, 'SKILL.md');
    writeFileSync(path, skillBody(tool));
    written.push(path);
    console.log(`  ${tool.skillsDir}/build-product/SKILL.md`);
  }

  if (written.length === 0) {
    console.error('No platform skills generated — check tool IDs.');
    process.exit(1);
  }

  return written;
}

export function platformRootDir(skillsDir) {
  return skillsDir.split('/')[0];
}

/** Unique top-level dirs for each tool (.cursor, .claude, …) */
export function allPlatformRoots(registry) {
  return [...new Set(registry.tools.map((t) => platformRootDir(t.skillsDir)))];
}

function readRuntimePlatformId(projectRoot) {
  const path = join(projectRoot, '.project/runtime.json');
  if (!existsSync(path)) return null;
  try {
    const runtime = JSON.parse(readFileSync(path, 'utf8'));
    return runtime.platformId || null;
  } catch {
    return null;
  }
}

function parseToolsArg(args, projectRoot) {
  const idx = args.indexOf('--tools');
  if (idx !== -1 && args[idx + 1]) {
    const raw = args[idx + 1];
    if (raw === 'all') {
      return loadRegistry(projectRoot).tools.map((t) => t.id);
    }
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }

  const fromRuntime = readRuntimePlatformId(projectRoot);
  if (fromRuntime) {
    console.log(`Using platform from .project/runtime.json: ${fromRuntime}`);
    return [fromRuntime];
  }

  console.error('No --tools specified and .project/runtime.json not found.');
  console.error('Run: npm run setup -- --tool cursor --clean');
  console.error('Or:  node scripts/generate-platform-skills.mjs --tools cursor');
  process.exit(1);
}

if (process.argv[1]?.endsWith('generate-platform-skills.mjs')) {
  const root = join(__dirname, '..');
  const toolIds = parseToolsArg(process.argv.slice(2), root);
  const n = generatePlatformSkills(root, toolIds);
  console.log(`\nGenerated ${n.length} platform skill(s).`);
}
