# Playbook 06: Deploy

**Agent:** 09-devops-engineer  
**Output:** running stack, `docs/deploy-log.md`, `state.baseUrl`

## Prerequisites

- `.project/deploy.json` filled during batch approvals
- `.ssh/` key present if remote (never commit)

## Local deploy

```bash
cd backend && docker compose up -d --build
# wait for health
for port in 8080 3001 3002; do curl -sf http://localhost:$port/health; done

cd frontend && npm install && npm run dev
# baseUrl = http://localhost:5173
```

## Remote deploy

```bash
# From project root
rsync -avz --exclude node_modules --exclude .git \
  -e "ssh -i .ssh/{key}" \
  ./ user@host:/path/to/app/

ssh -i .ssh/{key} user@host << 'EOF'
  cd /path/to/app/backend
  docker compose pull
  docker compose up -d --build
EOF
```

## Health checks

Every service must respond:

```
GET /health → 200 { "status": "ok" }
```

Gateway:

```
GET http://localhost:8080/health
```

## Frontend production (optional)

```bash
cd frontend && npm run build
# Serve via nginx container or preview
npm run preview  # port 4173
```

## deploy-log.md template

```markdown
# Deploy Log

- Date:
- Target: local | remote
- baseUrl:
- Backend health: OK | FAIL
- Frontend health: OK | FAIL
- Commands run: ...
- Issues: ...
```

## Handoff to Frontend Test Engineer

Set `state.baseUrl` only after ALL health checks pass.
