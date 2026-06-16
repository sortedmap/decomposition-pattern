# Orchestrator Playbook — State Machine

## Initial state

Create `.project/state.json`:

```json
{
  "phase": "bootstrap",
  "projectName": "",
  "approvals": {
    "requirements": false,
    "techStack": false,
    "pages": false,
    "prototype": false,
    "batchApprovals": false,
    "architecture": false,
    "apiSpecs": false
  },
  "services": [],
  "deployTarget": null,
  "baseUrl": null,
  "tests": { "backend": "pending", "frontend": "pending" },
  "prototypeReviewIterations": 0,
  "testFixIterations": { "backend": 0, "frontend": 0 }
}
```

Create `.project/runtime.json` during bootstrap — see [bootstrap.md](bootstrap.md).

## Phase transitions

| From | Action | To | Gate |
|------|--------|-----|------|
| bootstrap | detect platform → runtime.json; openspec init; set projectName | discovery | — |
| discovery | Delegate: 01-system-analyst | discovery | user approves requirements.md |
| discovery | Delegate: 02-tech-advisor | discovery | user approves tech-stack.md |
| discovery | Delegate: 01-system-analyst (pages) | discovery | user approves pages-spec.md |
| discovery | Delegate: 03-prototype-designer | prototype | npm run dev OK |
| prototype | Delegate: 04-prototype-reviewer (loop) | prototype_review | user approves OR max 5 iterations |
| prototype_review | batch questions → deploy.json | batch_approvals | all batch answers recorded |
| batch_approvals | Delegate: 05-architect | architecture | user approves architecture.md |
| architecture | Delegate: 06-api-designer × N (parallel if allowed) | api_design | user approves specs |
| api_design | Delegate: 06-api-designer (gateway) | gateway | api-gateway.yaml exists |
| gateway | Delegate: 07-backend-engineer × N (parallel if allowed) | backend | all services exist |
| backend | Delegate: 07-backend-engineer (compose) | backend | docker-compose.yaml |
| backend | Delegate: 08-backend-test-engineer × N | backend_tests | tests.backend = passed |
| backend_tests | Delegate: 10-frontend-engineer | frontend | FE works with API |
| frontend | Delegate: 09-devops-engineer | deploy | baseUrl set, health OK |
| deploy | Delegate: 11-frontend-test-engineer | frontend_tests | tests.frontend = passed |
| frontend_tests | — | done | notify user |

**Delegate** = follow `.project/runtime.json` → `delegation` mode in `platforms/delegation/`.

## Batch approvals (after prototype)

Ask user in ONE message:

1. Deploy target: local or remote server?
2. If remote: SSH key filename for `.ssh/`, host, user, app path on server
3. Need message broker (RabbitMQ/Kafka)? S3-compatible storage?
4. CI preference (GitHub Actions / none)?
5. Domain name (if any)?

Write answers to `.project/deploy.json`:

```json
{
  "target": "local",
  "ssh": { "key": ".ssh/id_rsa", "host": "", "user": "", "appPath": "" },
  "infra": { "messageBroker": false, "objectStorage": false },
  "ci": "none",
  "domain": null
}
```

Set `approvals.batchApprovals = true`.

## Parallel agent limits

When `runtime.parallelAgents` is true (Cursor, Claude Code, Windsurf):

- API design: max 4 concurrent
- Backend implementation: max 4 concurrent
- Backend tests: max 4 concurrent

Otherwise run agents **sequentially** (inline-role).

## Test fix loop

When `tests.backend === "failed"` or subagent reports failures:

1. Increment `testFixIterations.backend`
2. If <= 3: re-delegate 08-backend-test-engineer with failure log
3. If > 3: ask user how to proceed

Same for `testFixIterations.frontend` with 11-frontend-test-engineer.

## OpenSpec integration

Use command syntax from `runtime.commandSyntax` (`colon` → `/opsx:propose`, `hyphen` → `/opsx-propose`):

| Phase | OpenSpec action |
|-------|-----------------|
| discovery | propose → proposal + specs |
| architecture | update design.md in active change |
| backend | apply per task group |
| done | archive |

Fallback: write to `docs/requirements.md`, `docs/tasks.md` without OpenSpec CLI.

## Completion checklist

- [ ] All services in docker compose healthy
- [ ] Frontend at baseUrl loads authenticated routes
- [ ] Backend tests passed all services
- [ ] Frontend e2e passed all routes from pages-spec.md
- [ ] deploy-log.md written
- [ ] User receives final URL and run instructions
