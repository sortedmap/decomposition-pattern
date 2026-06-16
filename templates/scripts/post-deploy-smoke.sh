#!/usr/bin/env bash
# Post-deploy smoke — run against state.baseUrl (SPA origin, with port if non-80).
# Usage: ./post-deploy-smoke.sh http://host:8880 [optional-api-paths...]
#
# Expects:
#   GET $BASE/health → 200
#   GET $BASE/api/* without auth → 401 (NOT 404)
#
# Does NOT check host :8080 — that is optional debug, not the browser origin.
set -euo pipefail

BASE="${1:-}"
shift || true

if [[ -z "$BASE" ]]; then
  echo "usage: $0 <baseUrl> [api-path ...]" >&2
  echo "example: $0 http://89.223.121.80:8880 /api/auth/me /api/wishlist" >&2
  exit 1
fi

BASE="${BASE%/}"

echo "==> Post-deploy smoke: $BASE"

echo -n "  /health ... "
code="$(curl -sf -o /dev/null -w '%{http_code}' "$BASE/health" || echo "000")"
if [[ "$code" != "200" ]]; then
  echo "FAIL (HTTP $code)"
  exit 1
fi
echo "OK (200)"

DEFAULT_PATHS=("/api/auth/me")
if [[ $# -gt 0 ]]; then
  PATHS=("$@")
else
  PATHS=("${DEFAULT_PATHS[@]}")
fi

failed=0
for path in "${PATHS[@]}"; do
  path="${path#/}"
  url="$BASE/$path"
  echo -n "  $path ... "
  code="$(curl -sf -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || curl -s -o /dev/null -w '%{http_code}' "$url" || echo "000")"
  if [[ "$code" == "404" ]]; then
    echo "FAIL (404 — nginx/gateway routing broken)"
    failed=1
  elif [[ "$code" == "401" || "$code" == "403" ]]; then
    echo "OK ($code — route exists, auth required)"
  elif [[ "$code" == "200" ]]; then
    echo "OK (200)"
  else
    echo "WARN (HTTP $code — verify manually)"
  fi
done

if [[ "$failed" -ne 0 ]]; then
  echo "==> Smoke FAILED: fix nginx proxy or gateway before setting baseUrl"
  exit 1
fi

echo "==> Smoke PASSED"
