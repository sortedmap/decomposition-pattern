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
| bootstrap | detect platform → runtime.json; `npm run openspec -- init`; set projectName | discovery | — |
| discovery | Delegate: 01-system-analyst | tech_stack | user approves requirements.md |
| tech_stack | Delegate: 02-tech-advisor | pages | user approves tech-stack.md |
| pages | Delegate: 01-system-analyst (pages) | prototype | user approves pages-spec.md |
| prototype | Delegate: 03-prototype-designer | prototype | dev server + styled UI OK |
| prototype | Orchestrator: `npm install`, start `npm run dev` (background), message user | prototype | user reviews styled UI |
| prototype | Delegate: 04-prototype-reviewer (loop) | prototype_review | user approves OR max 5 iterations |
| prototype_review | batch questions → deploy.json | batch_approvals | all batch answers recorded |
| batch_approvals | Delegate: 05-architect | architecture | **auto:** `docs/architecture.md` complete → `approvals.architecture = true` |
| architecture | Delegate: 06-api-designer × N (parallel if allowed) | api_design | **auto:** all `docs/{service}/api.yaml` + `db.md` → `approvals.apiSpecs = true` |
| api_design | Delegate: 06-api-designer (gateway) | gateway | `docs/api-gateway.yaml` exists |
| gateway | **Parallel:** 07-backend-engineer × N + 10-frontend-engineer (phase A scaffold) | backend | all services exist in `backend/` |
| backend | Delegate: 07-backend-engineer (compose) | backend | `backend/docker-compose.yaml` |
| backend | Delegate: 08-backend-test-engineer × N | backend_tests | `tests.backend = passed` |
| backend_tests | Delegate: 10-frontend-engineer (phase B integration) | frontend | FE works with live API |
| frontend | Delegate: 09-devops-engineer | deploy | `baseUrl` set, API smoke via `$baseUrl/api/*` OK |
| deploy | Delegate: 11-frontend-test-engineer | frontend_tests | `tests.frontend = passed` (Playwright exit 0 vs `baseUrl`) |
| frontend_tests | — | done | notify user |

**Delegate** = follow `.project/runtime.json` → `delegation` mode in `platforms/delegation/`.

### Auto-gates (no user prompt)

After subagent DoD is met, orchestrator sets approval and advances **without asking the user**:

- `architecture` → `approvals.architecture = true`
- `api_design` → `approvals.apiSpecs = true`

### User-gates (explicit approval required)

- `requirements`, `techStack`, `pages`, `prototype`, `batchApprovals`

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

## Prototype gate (user review)

After agent 03 completes:

1. `cd prototype && npm install` (root `npm install` does **not** install prototype deps)
2. Start dev server: `npm run dev` in background — **do not** gate on `npm run build` alone
3. Tell user full launch block (see `playbooks/02-prototype.md` template):
   - `cd prototype && npm install && npm run dev`
   - Open Vite URL from stdout (usually `http://localhost:5173`)
   - **Warn:** no Live Preview / no opening `index.html` directly — Tailwind requires Vite
4. Wait for user approval of **styled** prototype

## Parallel agent limits

When `runtime.parallelAgents` is true (Cursor, Claude Code, Windsurf):

- API design: max 4 concurrent
- **After gateway:** backend implementation + frontend scaffold (phase A) — max 4 concurrent total
- Backend tests: max 4 concurrent

Otherwise run agents **sequentially** (inline-role).

## Test fix loop

When `tests.backend === "failed"` or subagent reports failures:

1. Increment `testFixIterations.backend`
2. If <= 3: re-delegate 08-backend-test-engineer with failure log
3. If > 3: ask user how to proceed

Same for `testFixIterations.frontend` with 11-frontend-test-engineer.

**Never set `tests.frontend = "passed"`** unless Playwright exited 0 against `state.baseUrl` (full URL including port).

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
- [ ] API smoke via `$baseUrl/api/*` (401 without token, not 404)
- [ ] Frontend at baseUrl loads authenticated routes
- [ ] Backend tests passed all services
- [ ] Frontend e2e passed all routes from pages-spec.md against `state.baseUrl`
- [ ] `docs/deploy-log.md` written with smoke + e2e results
- [ ] User receives final URL and run instructions
