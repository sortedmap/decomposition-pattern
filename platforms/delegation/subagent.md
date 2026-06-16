# Delegation: subagent (Claude Code, Windsurf, RooCode, Cline, Kilo Code)

Use the tool's native **subagent** or **agent** spawn mechanism when available.

## Rules

- One subagent per `.agents/NN-*.md` role
- Pass the agent file contents as the subagent system/task prompt
- Subagents must NOT communicate with the user
- If parallel spawn is supported and `parallelAgents` is true, max 4 concurrent

## Claude Code

Use the Agent tool / subagent feature with prompt from `.agents/NN-*.md`.

## Windsurf / RooCode / Cline

Use workflow or subagent invocation with the agent prompt file content.

## Fallback

If subagent API is unavailable in the current session, switch to [inline-role.md](inline-role.md).
