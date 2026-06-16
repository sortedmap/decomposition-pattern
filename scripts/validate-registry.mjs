#!/usr/bin/env node
/**
 * Verify platforms/registry.json skillsDir roots are listed in .gitignore.
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { loadRegistry, platformRootDir } from './generate-platform-skills.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const registry = loadRegistry(root);
const gitignore = readFileSync(join(root, '.gitignore'), 'utf8');

const roots = [...new Set(registry.tools.map((t) => platformRootDir(t.skillsDir)))];
const missing = [];

for (const tool of registry.tools) {
  if (tool.skillsDir.startsWith('.github/')) {
    if (!gitignore.includes('.github/skills/')) {
      missing.push('.github/skills/ (github-copilot)');
    }
    continue;
  }
  const dir = `${platformRootDir(tool.skillsDir)}/`;
  if (!gitignore.includes(dir)) {
    missing.push(`${dir} (${tool.id})`);
  }
}

if (missing.length > 0) {
  console.error('Registry platforms missing from .gitignore:\n');
  missing.forEach((m) => console.error(`  - ${m}`));
  process.exit(1);
}

console.log(`OK: ${roots.length} platform roots + .github/skills/ covered in .gitignore`);
