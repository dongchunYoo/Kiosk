#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

LOG_FILE="dev.log"

require_env_kv() {
	local key="$1"
	if [ ! -f .env ]; then
		echo "ERROR: .env not found (Backend_Node/.env)"
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

ensure_redis_prefix() {
	local root_dir root_name
	root_dir="$(cd "$PROJECT_DIR/.." && pwd)"
	root_name="$(basename "$root_dir")"

	# System-required key
	if ! grep -q '^REDIS_prefix=' .env; then
		echo "REDIS_prefix=$root_name" >> .env
	fi
	if [ -z "$(grep '^REDIS_prefix=' .env | head -n 1 | cut -d '=' -f2-)" ]; then
		sed -i '' -E "s#^REDIS_prefix=.*#REDIS_prefix=$root_name#" .env
	fi

	# Compatibility key
	if ! grep -q '^REDIS_PREFIX=' .env; then
		echo "REDIS_PREFIX=$root_name" >> .env
	fi
	if [ -z "$(grep '^REDIS_PREFIX=' .env | head -n 1 | cut -d '=' -f2-)" ]; then
		sed -i '' -E "s#^REDIS_PREFIX=.*#REDIS_PREFIX=$root_name#" .env
	fi
}

check_redis() {
	echo "[Redis] Checking redis-server..."
	if ! command -v redis-server >/dev/null 2>&1; then
		echo "ERROR: redis-server not found. Install Redis first."
		exit 1
	fi
	if ! command -v redis-cli >/dev/null 2>&1; then
		echo "ERROR: redis-cli not found. Install Redis first."
		exit 1
	fi

	if ! pgrep -x redis-server >/dev/null 2>&1; then
		echo "[Redis] Not running -> starting redis-server"
		redis-server --daemonize yes
		sleep 1
	fi

	if redis-cli ping >/dev/null 2>&1; then
		echo "[Redis] OK"
	else
		echo "ERROR: Redis is not responding"
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

echo "=== Backend_Node Development Script ==="

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

# 3) Build
echo "[3/5] Building..."
npm run build
echo "Build complete."

# 4) Env + Redis
echo "[4/5] Checking .env + Redis..."
require_env_kv PORT
ensure_redis_prefix
check_redis

# 5) Run + Log
echo "[5/5] Starting server..."
echo "Logging to $LOG_FILE (tail -f $LOG_FILE)"

npm run dev >> "$LOG_FILE" 2>&1 &
run_bg_pid="$!"

tail -f "$LOG_FILE"
