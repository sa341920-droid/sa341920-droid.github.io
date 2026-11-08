#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
command -v php >/dev/null || { echo 'PHP CLI missing'; exit 2; }
command -v node >/dev/null || { echo 'Node.js missing'; exit 2; }
while IFS= read -r -d '' f; do php -l "$f"; done < <(find "$ROOT/backend" -name '*.php' -print0)
node --check "$ROOT/frontend/assets/app.js"
node --check "$ROOT/frontend/assets/owner.js"
php -l "$ROOT/backend/cli/backup.php"
echo 'Static smoke checks passed. This does NOT test MySQL connectivity, browser flows, payment gateways, couriers, or production security.'
