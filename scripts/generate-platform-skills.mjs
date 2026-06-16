#!/usr/bin/env node
/**
 * Generate build-product SKILL.md for selected OpenSpec platforms.
 * Usage: node scripts/generate-platform-skills.mjs [--tools cursor,claude]
 */
import { readFileSync, mkdirSync, writeFileSync } from 'fs';
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
4. Set \`.project/runtime.json\` → \`platformId: "${tool.id}"\`

All paths relative to repository root.
`;
}

/** @returns {string[]} paths written */
export function generatePlatformSkills(projectRoot, toolIds) {
  const registry = loadRegistry(projectRoot);
  const selected = new Set(toolIds);
  const written = [];

  for (const tool of registry.tools) {
    if (!selected.has(tool.id)) continue;
    const dir = join(projectRoot, tool.skillsDir, 'build-product');
    mkdirSync(dir, { recursive: true });
    const path = join(dir, 'SKILL.md');
    writeFileSync(path, skillBody(tool));
    written.push(path);
    console.log(`  ${tool.skillsDir}/build-product/SKILL.md`);
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

function parseToolsArg(args) {
  const idx = args.indexOf('--tools');
  if (idx === -1 || !args[idx + 1]) {
    console.error('Usage: node scripts/generate-platform-skills.mjs --tools <id>[,<id>]');
    process.exit(1);
  }
  const raw = args[idx + 1];
  if (raw === 'all') {
    return loadRegistry(join(__dirname, '..')).tools.map((t) => t.id);
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

if (process.argv[1]?.endsWith('generate-platform-skills.mjs')) {
  const root = join(__dirname, '..');
  const toolIds = parseToolsArg(process.argv.slice(2));
  const n = generatePlatformSkills(root, toolIds);
  console.log(`\nGenerated ${n.length} platform skill(s).`);
}
