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

## Phase transitions

| From | Action | To | Gate |
|------|--------|-----|------|
| bootstrap | openspec init, set projectName | discovery | — |
| discovery | Task: 01-system-analyst | discovery | user approves requirements.md |
| discovery | Task: 02-tech-advisor | discovery | user approves tech-stack.md |
| discovery | Task: 01-system-analyst (pages) | discovery | user approves pages-spec.md |
| discovery | Task: 03-prototype-designer | prototype | npm run dev OK |
| prototype | Task: 04-prototype-reviewer (loop) | prototype_review | user approves OR max 5 iterations |
| prototype_review | batch questions → deploy.json | batch_approvals | all batch answers recorded |
| batch_approvals | Task: 05-architect | architecture | user approves architecture.md |
| architecture | Task: 06-api-designer × N (parallel) | api_design | user approves specs |
| api_design | Task: 06-api-designer (gateway) | gateway | api-gateway.yaml exists |
| gateway | Task: 07-backend-engineer × N (parallel, max 4) | backend | all services exist |
| backend | Task: 07-backend-engineer (compose) | backend | docker-compose.yaml |
| backend | Task: 08-backend-test-engineer × N | backend_tests | tests.backend = passed |
| backend_tests | Task: 10-frontend-engineer | frontend | FE works with API |
| frontend | Task: 09-devops-engineer | deploy | baseUrl set, health OK |
| deploy | Task: 11-frontend-test-engineer | frontend_tests | tests.frontend = passed |
| frontend_tests | — | done | notify user |

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

## Parallel Task limits

- API design: one Task per service, max 4 concurrent
- Backend implementation: one Task per service, max 4 concurrent
- Backend tests: one Task per service, max 4 concurrent

Queue remaining services; launch next when slot frees.

## Test fix loop

When `tests.backend === "failed"` or subagent reports failures:

1. Increment `testFixIterations.backend`
2. If <= 3: re-launch 08-backend-test-engineer with failure log
3. If > 3: ask user how to proceed

Same for `testFixIterations.frontend` with 11-frontend-test-engineer.

## OpenSpec integration

| Phase | OpenSpec action |
|-------|-----------------|
| discovery | `/opsx:propose "{projectName}"` → proposal + specs |
| architecture | update design.md in active change |
| backend | `/opsx:apply` per task group |
| done | `/opsx:archive` |

Fallback: write to `docs/requirements.md`, `docs/tasks.md` without OpenSpec CLI.

## Completion checklist

- [ ] All services in docker compose healthy
- [ ] Frontend at baseUrl loads authenticated routes
- [ ] Backend tests passed all services
- [ ] Frontend e2e passed all routes from pages-spec.md
- [ ] deploy-log.md written
- [ ] User receives final URL and run instructions
