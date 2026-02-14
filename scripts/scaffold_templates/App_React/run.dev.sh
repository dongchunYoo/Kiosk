#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_DIR"

LOG_FILE="dev.log"
touch "$LOG_FILE"

require_env_kv() {
	local key="$1"
	if [ ! -f .env ]; then
		echo "ERROR: .env not found (App_React/.env)"
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

# Logging: write everything to dev.log (and also show in terminal)
exec > >(tee -a "$LOG_FILE") 2>&1

echo "=== App_React Development Script ==="

# 1) Clean
echo "[1/5] Cleaning..."
: > "$LOG_FILE"
echo "Clean complete."

# 2) Install
echo "[2/5] Installing dependencies..."
if [ ! -d node_modules ]; then
	npm ci
fi
echo "Install complete."

# 3) Build/Validate
echo "[3/5] Expo doctor..."
npx expo-doctor

# 4) Env check
echo "[4/5] Checking .env..."
require_env_kv EXPO_PUBLIC_BACKEND_URL

# 5) Run + Log
echo "[5/5] Starting Expo (dev-client)..."
echo "Logging to $LOG_FILE (tail -f $LOG_FILE)"

# Metro port selection
DEFAULT_METRO_PORT=8081
METRO_PORT="$DEFAULT_METRO_PORT"
if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$METRO_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
	for p in 8082 8083 8084 8085; do
		if ! lsof -nP -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1; then
			METRO_PORT="$p"
			break
		fi
	done
fi
echo "Using Metro port: $METRO_PORT"

# Android SDK path (macOS defaults)
if [ -z "${ANDROID_HOME:-}" ]; then
	if [ -d "$HOME/Library/Android/sdk" ]; then
		export ANDROID_HOME="$HOME/Library/Android/sdk"
	elif [ -d "$HOME/Android/Sdk" ]; then
		export ANDROID_HOME="$HOME/Android/Sdk"
	fi
fi

if [ -n "${ANDROID_HOME:-}" ]; then
	export PATH="$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"
fi

# Required Android tools
if ! command -v adb >/dev/null 2>&1; then
	echo "ERROR: adb not found. Ensure Android SDK platform-tools are installed and in PATH."
	exit 1
fi
if ! command -v emulator >/dev/null 2>&1; then
	echo "ERROR: emulator not found. Ensure Android SDK emulator is installed and in PATH."
	exit 1
fi

# Start emulator if available and not running
AVD="$(emulator -list-avds 2>/dev/null | head -n 1 || true)"
if [ -n "$AVD" ]; then
	RUNNING="$(adb devices 2>/dev/null | grep -w emulator | wc -l | tr -d ' ')"
	if [ "$RUNNING" = "0" ]; then
		echo "Starting emulator: $AVD"
		nohup emulator -avd "$AVD" >/dev/null 2>&1 &
		adb wait-for-device
		sleep 3
	fi
	adb reverse tcp:"$METRO_PORT" tcp:"$METRO_PORT" || true
else
	echo "No Android emulators found. Create one in Android Studio (Device Manager)."
fi

export NODE_ENV=development

run_bg_pid=""
cleanup() {
	if [ -n "$run_bg_pid" ] && kill -0 "$run_bg_pid" >/dev/null 2>&1; then
		kill "$run_bg_pid" || true
	fi
}
trap cleanup EXIT

# Start expo in background, then tail logs
(npx expo start --dev-client --android --localhost --port "$METRO_PORT" >> "$LOG_FILE" 2>&1) &
run_bg_pid="$!"

tail -f "$LOG_FILE"
