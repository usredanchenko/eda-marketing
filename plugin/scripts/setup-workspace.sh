#!/usr/bin/env bash
# Creates an eda-marketing workspace: clones the repository and runs its bootstrap.
# Usage: bash setup-workspace.sh [dir] [ref]   (defaults: ~/eda-marketing, v0.1.0)
# Downloads: the repository, npm dependencies and a headless browser for rendering (~2 GB on disk).
# Publishes nothing, calls no paid services.
set -euo pipefail
DIR="${1:-$HOME/eda-marketing}"
REF="${2:-v0.1.0}"
REPO="https://github.com/usredanchenko/eda-marketing.git"

for bin in git node npm ffmpeg ffprobe; do
  command -v "$bin" >/dev/null || { echo "Missing $bin — install it first (see README → Requirements)." >&2; exit 1; }
done
node -e 'const [maj]=process.versions.node.split(".").map(Number); if (maj<22) { console.error("Node >= 22 is required"); process.exit(1) }'

if [ -e "$DIR" ] && [ -n "$(ls -A "$DIR" 2>/dev/null)" ]; then
  if [ -f "$DIR/engine/src/cli.ts" ]; then echo "Workspace already exists: $DIR"; exit 0; fi
  echo "$DIR exists and is not empty — choose another folder." >&2; exit 1
fi

git clone --depth 1 --branch "$REF" "$REPO" "$DIR" 2>/dev/null || git clone --depth 1 "$REPO" "$DIR"
cd "$DIR"
bash scripts/bootstrap.sh
echo
echo "Workspace ready: $DIR"
echo "Next: cd \"$DIR\" && claude   →   /eda-marketing:marketing brand new"
