#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) not installed. Install from https://cli.github.com and re-run." >&2
  exit 1
fi

echo "Watching latest CI run. Ctrl-C to exit."
gh run watch --exit-status || {
  echo "Run failed. Recent runs:" >&2
  gh run list --limit 5
  exit 1
}

