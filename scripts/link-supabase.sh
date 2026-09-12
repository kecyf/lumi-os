#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

# Hosted Lumi OS project. Override with SUPABASE_PROJECT_REF if needed.
DEFAULT_PROJECT_REF="yyjyylhsubbvtqixbnqe"
PROJECT_REF="${SUPABASE_PROJECT_REF:-${SUPABASE_PROJECT_ID:-$DEFAULT_PROJECT_REF}}"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" || -z "${SUPABASE_DB_PASSWORD:-}" ]]; then
  echo "Supabase token or database password is not set; skipping link (in-memory demo mode)."
  exit 0
fi

export SUPABASE_PROJECT_REF="$PROJECT_REF"

CLI=(bun x supabase --agent yes --yes)

echo "Linking Supabase project ${PROJECT_REF}..."
"${CLI[@]}" link --project-ref "$PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"

# The hosted project already has its own migration history from local work.
# Do not `db push` on boot: remote versions are missing from this repo and
# the CLI refuses a legacy push. Apply schema separately after histories match.

echo "Materializing Next.js env from project API keys..."
"${CLI[@]}" projects api-keys --project-ref "$PROJECT_REF" --reveal --output json \
  | bun scripts/write-supabase-env.ts
