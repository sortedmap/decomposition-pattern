#!/usr/bin/env bash
# Remote deploy template — copy to generated project: scripts/deploy-remote.sh
#
# Prerequisites:
#   - `.project/deploy.json` with ssh.host, ssh.user, ssh.key, ssh.appPath
#   - SSH private key at the path specified in deploy.json (relative to project root)
#   - Docker + docker compose on the remote host
#
# Framework repo keeps this under templates/scripts/ only.
# DevOps agent copies and adapts for each product — do not commit product-specific paths here.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPLOY_JSON="${DEPLOY_JSON:-$ROOT/.project/deploy.json}"

if [[ ! -f "$DEPLOY_JSON" ]]; then
  echo "error: missing $DEPLOY_JSON" >&2
  exit 1
fi

read_deploy() {
  node -e "
    const fs = require('fs');
    const cfg = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
    const ssh = cfg.ssh || {};
    const lines = [
      ssh.host || '',
      ssh.user || '',
      ssh.key || '.ssh/id_rsa',
      ssh.appPath || '/var/www/app',
    ];
    process.stdout.write(lines.join('\n'));
  " "$DEPLOY_JSON"
}

DEPLOY_OUTPUT="$(read_deploy)"
HOST="$(printf '%s\n' "$DEPLOY_OUTPUT" | sed -n '1p')"
USER="$(printf '%s\n' "$DEPLOY_OUTPUT" | sed -n '2p')"
KEY_REL="$(printf '%s\n' "$DEPLOY_OUTPUT" | sed -n '3p')"
APP_PATH="$(printf '%s\n' "$DEPLOY_OUTPUT" | sed -n '4p')"

if [[ -z "$HOST" ]]; then
  echo "error: ssh.host is not set in $DEPLOY_JSON" >&2
  exit 1
fi

if [[ -z "$USER" ]]; then
  echo "error: ssh.user is not set in $DEPLOY_JSON" >&2
  exit 1
fi

KEY_PATH="$ROOT/$KEY_REL"
if [[ ! -f "$KEY_PATH" ]]; then
  echo "error: SSH key not found at $KEY_PATH" >&2
  exit 1
fi

SSH_OPTS=(-i "$KEY_PATH" -o StrictHostKeyChecking=accept-new)
REMOTE="${USER}@${HOST}"
RSYNC_SSH="ssh -i '$KEY_PATH' -o StrictHostKeyChecking=accept-new"

echo "==> Syncing project to ${REMOTE}:${APP_PATH}"
rsync -avz --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude dist \
  --exclude frontend/node_modules \
  --exclude 'backend/*/node_modules' \
  --exclude .ssh \
  --exclude .env \
  --exclude .env.local \
  -e "$RSYNC_SSH" \
  "$ROOT/" "${REMOTE}:${APP_PATH}/"

echo "==> Building and starting stack on remote"
ssh "${SSH_OPTS[@]}" "$REMOTE" bash -s <<EOF
set -euo pipefail
cd "${APP_PATH}/backend"
if [[ ! -f .env ]]; then
  echo "warning: ${APP_PATH}/backend/.env missing — copy from .env.example and set secrets"
fi
docker compose pull || true
docker compose up -d --build
docker compose ps
EOF

echo "==> Remote deploy finished. Run post-deploy-smoke.sh against baseUrl (see playbooks/06-deploy.md)."
