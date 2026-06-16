# Delegation: task-tool (Cursor)

Use the **Task** tool to delegate to specialized agents.

## Rules

- `subagent_type`: `generalPurpose` for implementation; `shell` for deploy/tests; `explore` for read-only analysis
- Max **4 parallel** Task invocations when `parallelAgents` is true
- Pass full content of `.agents/NN-{name}.md` plus context in the prompt
- Subagents must NOT communicate with the user

## Template

```
Task:
  subagent_type: generalPurpose
  prompt: |
    {contents of .agents/07-backend-engineer.md}

    Service: {service_name}
    Project root: {cwd}
```

## Parallel backend services

Launch up to 4 Tasks at once; queue remaining services from `.project/state.json` → `services[]`.
