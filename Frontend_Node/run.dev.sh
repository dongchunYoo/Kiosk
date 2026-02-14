#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

echo "=== Frontend_Node Development Script ==="

# 1. Clean
echo "[1/5] Cleaning..."
rm -rf node_modules dist dev.log
echo "Clean complete."

# 2. Install
echo "[2/5] Installing dependencies..."
npm install
echo "Install complete."

# 3. Build
echo "[3/5] Building (skipped for dev mode)..."
echo "Build step skipped - Vite handles this in dev mode."

# 4. Check .env for PORT
if [ ! -f ".env" ]; then
  echo "ERROR: .env file not found. Please create .env with PORT configuration."
  exit 1
fi

if ! grep -q "^PORT=" .env; then
  echo "ERROR: PORT not found in .env. Please add PORT to .env file."
  exit 1
fi

# Extract PORT from .env
PORT=$(grep "^PORT=" .env | cut -d '=' -f2)
echo "Using PORT: $PORT"

# 5. Run with logging
echo "[4/5] Starting Frontend_Node development server..."
echo "Logging to dev.log (use 'tail -f dev.log' to monitor)"
echo ""

# Run Vite dev server with PORT and pipe output to both console and dev.log
PORT=$PORT npm run dev | tee dev.log
