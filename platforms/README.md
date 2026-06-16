# Platform support

One AI platform per project — configured via `npm run setup`.

Registry: [registry.json](registry.json) (same IDs as OpenSpec)

## Setup (recommended)

```bash
npm install
npm run setup -- --tool cursor --clean
```

OpenSpec — локальная dev-зависимость, без глобальной установки.

| Flag | Description |
|------|-------------|
| `--tool <id>` | Platform ID (`cursor`, `claude`, …) |
| `--detect` | Guess from environment |
| `--clean` | Remove other platform folders from project root |
| `--skip-openspec` | Skip `openspec init` |
| `--list` | Print all platform IDs |

Interactive (no flags): `npm run setup`

## What appears in project root

After `npm run setup -- --tool cursor --clean`:

```
my-product/
├── .cursor/skills/build-product/   ← only Cursor
├── .project/runtime.json
├── openspec/                       ← if OpenSpec installed
├── build-product/                  ← framework core (always)
├── .agents/
└── …
```

No `.claude/`, `.windsurf/`, etc. unless you run setup for those tools separately.

## Supported tool IDs

`amazon-q`, `antigravity`, `auggie`, `bob`, `claude`, `cline`, `codex`, `forgecode`, `codebuddy`, `continue`, `costrict`, `crush`, `cursor`, `factory`, `gemini`, `github-copilot`, `iflow`, `junie`, `kilocode`, `kimi`, `kiro`, `lingma`, `opencode`, `pi`, `qoder`, `qwen`, `roocode`, `trae`, `vibe`, `windsurf`

## Delegation modes

| Mode | Platforms | Parallel |
|------|-----------|----------|
| `task-tool` | Cursor | Yes (max 4) |
| `subagent` | Claude Code, Windsurf, RooCode, Cline, Kilo Code | Varies |
| `slash-command` | Most others | Sequential |
| `skill-only` | ForgeCode, Kimi, Trae, Vibe | Sequential |

Details: [delegation/](delegation/)
