# Delegation: slash-command (most OpenSpec tools)

Tools with generated `opsx-*` command files. `/build-product` runs as a skill or slash command.

## Rules

- Orchestrator runs in the main chat session
- Delegate by **inline role switch** (see [inline-role.md](inline-role.md)) unless the tool exposes native subagents
- Use OpenSpec commands for spec phases when OpenSpec is initialized:
  - `propose` / `opsx:propose` / `opsx-propose` (see platform commandSyntax)
  - `apply` / `opsx:apply` / `opsx-apply`

## Command syntax by platform

Check `platforms/registry.json` → `commandSyntax`:

| Syntax | Example |
|--------|---------|
| `colon` | `/opsx:propose`, `/opsx:apply` |
| `hyphen` | `/opsx-propose`, `/opsx-apply` |
| `skill` | skill-based invocation (no opsx command files) |

## Sequential execution

Without Task tool, run agents **one at a time** in dependency order. Update `.project/state.json` after each.
