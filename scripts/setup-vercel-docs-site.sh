#!/usr/bin/env bash
# Point the Vercel project at apps/docs-site (replaces old chatbot-demo root).
# Usage: ./scripts/setup-vercel-docs-site.sh
# Requires apps/docs-site/.env.vercel with VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT/apps/docs-site/.env.vercel"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — copy from apps/docs-site/.env.vercel.example"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

for key in VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID; do
  if [ -z "${!key:-}" ]; then
    echo "Missing $key in $ENV_FILE"
    exit 1
  fi
done

echo "Updating Vercel project $VERCEL_PROJECT_ID → rootDirectory=apps/docs-site"

curl -fsS -X PATCH \
  "https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}?teamId=${VERCEL_ORG_ID}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory":"apps/docs-site","framework":"nextjs"}' \
  | python3 -c "import json,sys; p=json.load(sys.stdin); print('OK:', p.get('name'), 'rootDirectory=', p.get('rootDirectory'))"

echo "Done. Git auto-deploy is disabled in vercel.json — use GitHub Actions deploy-vercel job."
