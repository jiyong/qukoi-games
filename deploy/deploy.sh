#!/usr/bin/env bash
# Run on the server: pulls the repo and syncs the public files into the web root.
# Usage: bash deploy.sh            (first run clones, later runs update)
set -euo pipefail

REPO="git@codeup.aliyun.com:tup/qu/game-qukoi-com.git"
BRANCH="${BRANCH:-main}"
SRC="${SRC:-/opt/game-qukoi-com}"
WEB_ROOT="${WEB_ROOT:-/var/www/game.qukoi.com}"

if [ -d "$SRC/.git" ]; then
  git -C "$SRC" fetch --depth 1 origin "$BRANCH"
  git -C "$SRC" reset --hard "origin/$BRANCH"
else
  git clone --depth 1 --branch "$BRANCH" "$REPO" "$SRC"
fi

mkdir -p "$WEB_ROOT"
rsync -a --delete \
  --include='/index.html' --include='/portal.js' --include='/games.json' \
  --include='/thumbs/***' --include='/games/***' \
  --exclude='*' \
  "$SRC/" "$WEB_ROOT/"

echo "Deployed $(git -C "$SRC" rev-parse --short HEAD) to $WEB_ROOT"
