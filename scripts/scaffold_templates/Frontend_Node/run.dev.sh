#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

LOG_FILE="dev.log"

require_env_kv() {
	local key="$1"
	if [ ! -f .env ]; then
		echo "ERROR: .env not found (Frontend_Node/.env)"
		exit 1
	fi
	if ! grep -q "^${key}=" .env; then
		echo "ERROR: $key not found in .env"
		exit 1
	fi
	local val
	val="$(grep "^${key}=" .env | head -n 1 | cut -d '=' -f2-)"
	if [ -z "$val" ]; then
		echo "ERROR: $key is empty in .env (must be manually set)"
		exit 1
	fi
}

run_bg_pid=""
cleanup() {
	if [ -n "$run_bg_pid" ] && kill -0 "$run_bg_pid" >/dev/null 2>&1; then
		kill "$run_bg_pid" || true
	fi
}
trap cleanup EXIT

echo "=== Frontend_Node Development Script ==="

# 1) Clean
echo "[1/5] Cleaning..."
rm -rf dist
: > "$LOG_FILE"
echo "Clean complete."

# 2) Install
echo "[2/5] Installing dependencies..."
if [ ! -d node_modules ]; then
	npm ci
fi
echo "Install complete."

# 3) Env check (must exist before Vite config evaluation)
echo "[3/5] Checking .env..."
require_env_kv PORT
require_env_kv NodePath

# 4) Build
echo "[4/5] Building..."
npm run build
echo "Build complete."

# 5) Run + Log
echo "[5/5] Starting dev server..."
echo "Logging to $LOG_FILE (tail -f $LOG_FILE)"

npm run dev >> "$LOG_FILE" 2>&1 &
run_bg_pid="$!"

tail -f "$LOG_FILE"
