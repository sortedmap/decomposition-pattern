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

## Parallel backend + frontend scaffold (after gateway)

When `runtime.parallelAgents` is true, after gateway spec is ready:

```
par Parallel implementation (max 4 total)
  Task → 07-backend-engineer per service (up to 4)
  Task → 10-frontend-engineer phase A (scaffold) — one Task
end
```

Queue excess backend services; run frontend phase A once (not per service).

After all backend services exist + compose → backend tests → **10-frontend-engineer phase B** (sequential integration).

## Deploy and e2e

- **09-devops-engineer**: `subagent_type: shell` recommended (docker, rsync, curl smoke)
- **11-frontend-test-engineer**: `subagent_type: shell` for Playwright; must use full `state.baseUrl`
