#!/usr/bin/env bash
# Optional: installs recommended third-party skills into .claude/skills (project scope).
# Read each skill before installing it. Nothing runs without your confirmation.
set -euo pipefail
cd "$(dirname "$0")/.."
CMDS=(
  "npx skills add vyralcontent/content-skills -a claude-code -s viral-hooks viral-short-form viral-captions-and-ctas"
  "npx skills add coreyhaines31/marketingskills -a claude-code -s product-marketing social marketing-ideas video"
  "npx skills add mvanhorn/last30days-skill -a claude-code"
  "npx skills add remotion-dev/skills -a claude-code"
)
for c in "${CMDS[@]}"; do
  read -r -p "Run: $c ? [y/N] " a
  if [ "${a:-n}" = "y" ]; then eval "$c"; else echo "skipped"; fi
done
