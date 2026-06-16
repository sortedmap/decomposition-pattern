# Delegation: inline-role (universal fallback)

Works in **every** AI environment. No Task tool or subagents required.

## Rules

- Orchestrator reads `.agents/NN-*.md` and **adopts that role** in the same conversation
- Complete the agent's Definition of Done before returning to orchestrator role
- Never ask the user questions while in a subagent role — only orchestrator talks to user
- Run agents **sequentially** (one service at a time for backend)

## Template

```
[System: You are now Backend Engineer. Read .agents/07-backend-engineer.md.
 Service: {service-name}. Do NOT talk to the user.]

... implement ...

[System: Return to Orchestrator. Update .project/state.json. Report to user.]
```

## When to use

- Fallback when Task/subagent tools are unavailable
- Default for `slash-command` and `skill-only` platforms
- Explicitly selected via `.project/runtime.json` → `"delegation": "inline-role"`
