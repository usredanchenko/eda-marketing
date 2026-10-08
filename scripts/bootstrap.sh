#!/usr/bin/env bash
# Marketing OS: repeatable setup on this machine. Publishes nothing and spends no money.
# Run: bash scripts/bootstrap.sh
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== Node and dependencies"
node -e 'const [maj]=process.versions.node.split(".").map(Number); if (maj<22) { console.error("Node >= 22 is required"); process.exit(1) }'
npm install --no-audit --no-fund

echo "== Git hook: secret scan before commit"
if [ -d .git ]; then cp scripts/pre-commit .git/hooks/pre-commit && chmod +x .git/hooks/pre-commit; fi
command -v gitleaks >/dev/null || echo "! gitleaks is not installed: brew install gitleaks"

echo "== Assets (heavy media are not stored in git)"
echo "-- Restore your own media (harmless when there is nothing to restore)"
npm run -s mos -- assets restore
echo "-- Synthesize UI sounds"
npm run -s mos -- assets sfx
echo "-- Generate the example brand's footage and mock screens"
npm run -s mos -- assets examples
echo "-- Verify assets against provenance"
npm run -s mos -- assets verify

echo "== Brands: PRODUCT_FACTS.md and HyperFrames tokens"
npm run -s mos -- brand validate
npm run -s mos -- brand facts
npm run -s mos -- tokens

echo "== Render browser (Chrome Headless Shell, the version Remotion is tested with)"
if ! (cd video/remotion && npx remotion browser ensure); then
  echo "! npx remotion browser ensure failed; falling back to Chrome for Testing"
  if ! ls cache/browsers/chrome-headless-shell-*/*/chrome-headless-shell >/dev/null 2>&1; then
    VERSION=$(node -e 'console.log(require("./node_modules/@remotion/renderer/dist/browser/get-chrome-download-url.js").TESTED_VERSION)')
    case "$(uname -s)-$(uname -m)" in
      Darwin-arm64) ARCH=mac-arm64 ;;
      Darwin-*) ARCH=mac-x64 ;;
      Linux-x86_64) ARCH=linux64 ;;
      *) echo "! no Chrome for Testing build for $(uname -s)-$(uname -m); install a browser manually"; exit 1 ;;
    esac
    mkdir -p cache/browsers
    echo "Downloading chrome-headless-shell $VERSION ($ARCH) from the official Chrome for Testing CDN (~100 MB)…"
    curl -fsSL --retry 3 -o cache/browsers/chs.zip "https://storage.googleapis.com/chrome-for-testing-public/$VERSION/$ARCH/chrome-headless-shell-$ARCH.zip"
    unzip -q cache/browsers/chs.zip -d "cache/browsers/chrome-headless-shell-$VERSION" && rm cache/browsers/chs.zip
  fi
fi

echo "== Composition registry and environment check"
npm run -s mos -- video register
npm run -s mos -- memory rebuild
npm run -s mos -- doctor

echo "== Tests"
npm test
echo "Done. Studio: npm run studio → http://localhost:3100"
