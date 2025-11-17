#!/usr/bin/env bash
# Verify that Vercel repo secrets are set and valid
set -euo pipefail

# Usage:
# VERCEL_TOKEN=<token> VERCEL_ORG_ID=<org> VERCEL_PROJECT_ID=<project> ./scripts/ops/verify-vercel-secrets.sh

: "${VERCEL_TOKEN:?VERCEL_TOKEN is not set. Provide it as env var or export in shell.}"
: "${VERCEL_ORG_ID:?VERCEL_ORG_ID is not set. Provide it as env var or export in shell.}"
: "${VERCEL_PROJECT_ID:?VERCEL_PROJECT_ID is not set. Provide it as env var or export in shell.}"

command -v npx >/dev/null 2>&1 || { echo "npx is required but not found. Install Node.js/npm and ensure npx is in PATH."; exit 1; }

echo "Verifying Vercel token and account info..."

# show whoami
echo "Checking token identity..."
set +e
npx vercel whoami --token "$VERCEL_TOKEN" 2>/dev/null
WHOAMI_EXIT=$?
set -e

if [ "$WHOAMI_EXIT" -ne 0 ]; then
  echo "ERROR: vercel token validation failed. Ensure the token is valid (vercel login or create new token)."
  exit 1
else
  echo "VERCEL token is valid for the returned account above."
fi

# Try to list or inspect the project
echo "Checking Project ID..."
set +e
npx vercel projects ls --token "$VERCEL_TOKEN" | grep -i "$VERCEL_PROJECT_ID" >/dev/null 2>&1
LIST_EXIT=$?
set -e

if [ "$LIST_EXIT" -eq 0 ]; then
  echo "Found Vercel project with ID or name match: $VERCEL_PROJECT_ID"
else
  echo "Could not find project via 'projects ls'. Attempting inspect..."
  set +e
  npx vercel inspect "$VERCEL_PROJECT_ID" --token "$VERCEL_TOKEN" >/dev/null 2>&1
  INSPECT_EXIT=$?
  set -e
  if [ "$INSPECT_EXIT" -eq 0 ]; then
    echo "Verified Vercel project ID: $VERCEL_PROJECT_ID"
  else
    echo "WARNING: Vercel project with ID $VERCEL_PROJECT_ID not found or token lacks project read permissions."
    echo "Use 'vercel projects ls --token $VERCEL_TOKEN' to list projects or check the Project ID in Vercel console."
  fi
fi

# Check if team/org is available from token
set +e
npx vercel teams ls --token "$VERCEL_TOKEN" | grep -i "$VERCEL_ORG_ID" >/dev/null 2>&1
TEAMS_EXIT=$?
set -e

if [ "$TEAMS_EXIT" -eq 0 ]; then
  echo "VERCEL_ORG_ID verified (found in teams)."
else
  echo "VERCEL_ORG_ID not found among team list. Please validate Organization ID in Vercel console."
fi

echo "Done. If you see 'Warning' messages, confirm the token has proper scopes and the token is for the right account."
