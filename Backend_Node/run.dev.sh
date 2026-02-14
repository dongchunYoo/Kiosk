#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "=== Backend_Node Development Script ==="

# 1. Clean
echo "[1/5] Cleaning..."
rm -rf node_modules dist dev.log
echo "Clean complete."

# 2. Install
echo "[2/5] Installing dependencies..."
npm install
echo "Install complete."

# 3. Build
echo "[3/5] Building TypeScript..."
npm run build
echo "Build complete."

# 4. Check .env for PORT
if [ ! -f ".env" ]; then
  echo "ERROR: .env file not found. Please create .env with PORT configuration."
  exit 1
fi

if ! grep -q "^PORT=" .env; then
  echo "ERROR: PORT not found in .env. Please add PORT to .env file."
  exit 1
fi

# 5. Check Redis server
echo "[4/5] Checking Redis server..."
if ! pgrep -x "redis-server" > /dev/null; then
  echo "Redis server not running. Starting redis-server..."
  redis-server --daemonize yes
  sleep 2
fi

# Verify Redis connection
if redis-cli ping > /dev/null 2>&1; then
  echo "Redis server is running and responding."
else
  echo "ERROR: Redis server failed to start or is not responding."
  exit 1
fi

# 6. Run with logging
echo "[5/5] Starting Backend_Node server..."
echo "Logging to dev.log (use 'tail -f dev.log' to monitor)"
echo ""

# Run the server and pipe output to both console and dev.log
npm run dev | tee dev.log
