#!/usr/bin/env bash
set -euo pipefail

# CI Status Table Display
# Displays CI job statuses in a formatted table

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to get status color
get_status_color() {
  local status="$1"
  local conclusion="$2"

  if [ "$status" = "completed" ]; then
    if [ "$conclusion" = "success" ]; then
      echo -n "$GREEN"
    elif [ "$conclusion" = "failure" ]; then
      echo -n "$RED"
    elif [ "$conclusion" = "cancelled" ]; then
      echo -n "$YELLOW"
    else
      echo -n "$BLUE"
    fi
  elif [ "$status" = "in_progress" ]; then
    echo -n "$CYAN"
  elif [ "$status" = "queued" ]; then
    echo -n "$YELLOW"
  else
    echo -n "$PURPLE"
  fi
}

# Function to format status text
format_status() {
  local status="$1"
  local conclusion="$2"

  if [ "$status" = "completed" ]; then
    case "$conclusion" in
      "success") echo "✅ SUCCESS" ;;
      "failure") echo "❌ FAILED" ;;
      "cancelled") echo "⏹️  CANCELLED" ;;
      "skipped") echo "⏭️  SKIPPED" ;;
      *) echo "❓ $conclusion" ;;
    esac
  elif [ "$status" = "in_progress" ]; then
    echo "⏳ RUNNING"
  elif [ "$status" = "queued" ]; then
    echo "⏰ QUEUED"
  else
    echo "❓ $status"
  fi
}

# Get CI run ID
RUN_ID=$(gh run list --workflow "ironclad.yml" --limit 1 --json databaseId -q '.[0].databaseId' 2>/dev/null || echo "")

if [ -z "$RUN_ID" ]; then
  echo -e "${RED}❌ No CI runs found${NC}"
  exit 1
fi

# Get job data
JOBS_DATA=$(gh run view "$RUN_ID" --json jobs 2>/dev/null || echo "")

if [ -z "$JOBS_DATA" ]; then
  echo -e "${RED}❌ Unable to fetch job details${NC}"
  exit 1
fi

# Display header
echo -e "${BLUE}🚀 Ironclad CI Status - Run #$RUN_ID${NC}"
echo -e "${BLUE}$(date)${NC}"
echo

# Table header
printf "%-20s %-12s %-15s\n" "TEST NAME" "STATUS" "DETAILS"
printf "%-20s %-12s %-15s\n" "---------" "------" "-------"

# Parse and display jobs
echo "$JOBS_DATA" | jq -r '.jobs[] | "\(.name)|\(.status)|\(.conclusion // "pending")"' | while IFS='|' read -r name status conclusion; do
  color=$(get_status_color "$status" "$conclusion")
  status_text=$(format_status "$status" "$conclusion")

  printf "%-20s ${color}%-12s${NC} %-15s\n" "$name" "$status_text" "$conclusion"
done

echo
echo -e "${BLUE}💡 Use 'npm run ci:monitor' for continuous monitoring${NC}"
