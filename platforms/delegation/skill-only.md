# Delegation: skill-only (ForgeCode, Kimi CLI, Trae, Mistral Vibe)

These tools have **skills but no generated opsx command files** (per OpenSpec).

## Rules

- Invoke `/build-product` or the skill name directly
- Delegate via [inline-role.md](inline-role.md) — sequential role switching in one session
- No parallel agents
- OpenSpec CLI still works for artifacts: `openspec`, `docs/requirements.md`

## Trae / Kimi

Use skill-based invocations such as `/skill:build-product` or `/openspec-propose` if OpenSpec skills are also installed.
