#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEMPLATES_DIR="$REPO_ROOT/scripts/scaffold_templates"

usage() {
	cat <<'EOF'
Usage:
	./scripts/scaffold.sh /absolute/path/to/NewProjectRoot

Notes:
- Creates: Backend_Node, Frontend_Node, App_React, Docs
- Generates .env/.env.example and run.dev.sh for each project
- Copies dependency manifests (package.json + package-lock.json) from this repo
- PORT values in generated .env are intentionally blank (must be filled manually)
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
	usage
	exit 0
fi

TARGET_ROOT="${1:-}"
if [ -z "$TARGET_ROOT" ]; then
	usage
	echo ""
	echo "ERROR: target path is required"
	exit 1
fi

if [[ "$TARGET_ROOT" != /* ]]; then
	echo "ERROR: target path must be absolute"
	exit 1
fi

PROJECT_NAME="$(basename "$TARGET_ROOT")"

if [ -e "$TARGET_ROOT" ] && [ -n "$(ls -A "$TARGET_ROOT" 2>/dev/null || true)" ]; then
	echo "ERROR: target directory exists and is not empty: $TARGET_ROOT"
	echo "       Please choose an empty directory."
	exit 1
fi

mkdir -p "$TARGET_ROOT"

copy_file() {
	local src="$1"
	local dst="$2"
	mkdir -p "$(dirname "$dst")"
	cp -f "$src" "$dst"
}

write_text() {
	# Usage: write_text /path/to/file "content..."
	local dst="$1"
	local content="$2"
	mkdir -p "$(dirname "$dst")"
	printf '%s' "$content" > "$dst"
}

make_executable() {
	chmod +x "$1"
}

copy_tree() {
	local src_dir="$1"
	local dst_dir="$2"
	mkdir -p "$dst_dir"
	# Use "/." to include dotfiles like .env
	cp -R "$src_dir/." "$dst_dir/"
}

echo "=== Scaffold ==="
echo "From : $REPO_ROOT"
echo "To   : $TARGET_ROOT"
echo "Name : $PROJECT_NAME"
echo ""

########################################
# Docs
########################################
if [ -d "$REPO_ROOT/Docs" ]; then
	echo "[1/4] Copying Docs..."
	cp -R "$REPO_ROOT/Docs" "$TARGET_ROOT/"
else
	echo "[1/4] Docs not found; creating empty Docs/"
	mkdir -p "$TARGET_ROOT/Docs"
fi

########################################
# Backend_Node
########################################
echo "[2/4] Creating Backend_Node..."
mkdir -p "$TARGET_ROOT/Backend_Node"

copy_file "$REPO_ROOT/Backend_Node/package.json" "$TARGET_ROOT/Backend_Node/package.json"
copy_file "$REPO_ROOT/Backend_Node/package-lock.json" "$TARGET_ROOT/Backend_Node/package-lock.json"
copy_file "$REPO_ROOT/Backend_Node/tsconfig.json" "$TARGET_ROOT/Backend_Node/tsconfig.json"

if [ ! -d "$TEMPLATES_DIR/Backend_Node" ]; then
	echo "ERROR: missing templates at $TEMPLATES_DIR/Backend_Node"
	exit 1
fi
copy_tree "$TEMPLATES_DIR/Backend_Node" "$TARGET_ROOT/Backend_Node"
make_executable "$TARGET_ROOT/Backend_Node/run.dev.sh"

########################################
# Frontend_Node
########################################
echo "[3/4] Creating Frontend_Node..."
mkdir -p "$TARGET_ROOT/Frontend_Node"

copy_file "$REPO_ROOT/Frontend_Node/package.json" "$TARGET_ROOT/Frontend_Node/package.json"
copy_file "$REPO_ROOT/Frontend_Node/package-lock.json" "$TARGET_ROOT/Frontend_Node/package-lock.json"
copy_file "$REPO_ROOT/Frontend_Node/eslint.config.js" "$TARGET_ROOT/Frontend_Node/eslint.config.js"
copy_file "$REPO_ROOT/Frontend_Node/index.html" "$TARGET_ROOT/Frontend_Node/index.html"

if [ ! -d "$TEMPLATES_DIR/Frontend_Node" ]; then
	echo "ERROR: missing templates at $TEMPLATES_DIR/Frontend_Node"
	exit 1
fi
copy_tree "$TEMPLATES_DIR/Frontend_Node" "$TARGET_ROOT/Frontend_Node"
make_executable "$TARGET_ROOT/Frontend_Node/run.dev.sh"

########################################
# App_React
########################################
echo "[4/4] Creating App_React..."
mkdir -p "$TARGET_ROOT/App_React"

copy_file "$REPO_ROOT/App_React/package.json" "$TARGET_ROOT/App_React/package.json"
copy_file "$REPO_ROOT/App_React/package-lock.json" "$TARGET_ROOT/App_React/package-lock.json"
copy_file "$REPO_ROOT/App_React/app.json" "$TARGET_ROOT/App_React/app.json"
copy_file "$REPO_ROOT/App_React/babel.config.js" "$TARGET_ROOT/App_React/babel.config.js"
copy_file "$REPO_ROOT/App_React/tsconfig.json" "$TARGET_ROOT/App_React/tsconfig.json"
copy_file "$REPO_ROOT/App_React/tailwind.config.js" "$TARGET_ROOT/App_React/tailwind.config.js"
copy_file "$REPO_ROOT/App_React/nativewind-env.d.ts" "$TARGET_ROOT/App_React/nativewind-env.d.ts"

if [ ! -d "$TEMPLATES_DIR/App_React" ]; then
	echo "ERROR: missing templates at $TEMPLATES_DIR/App_React"
	exit 1
fi
copy_tree "$TEMPLATES_DIR/App_React" "$TARGET_ROOT/App_React"
make_executable "$TARGET_ROOT/App_React/run.dev.sh"

echo ""
echo "DONE: Scaffold created at $TARGET_ROOT"
echo "NEXT: Fill required values in each .env, then run each ./run.dev.sh"
