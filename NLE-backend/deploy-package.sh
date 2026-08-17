#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

cd "$BACKEND_DIR"
npm install --legacy-peer-deps
npm run build

cd "$FRONTEND_DIR"
npm install --legacy-peer-deps
npm run build

mkdir -p "$BACKEND_DIR/dist/frontend"
cp -R "$FRONTEND_DIR/dist" "$BACKEND_DIR/dist/frontend/"

echo "Deployment package ready"
