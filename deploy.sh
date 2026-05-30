#!/usr/bin/env bash
# Quick deploy helper: commit local changes and push to GitHub.
# GitHub Actions takes over from there and rebuilds the live site (~1 min).
#
# Usage:
#   ./deploy.sh                       # auto-generate a commit message from changed files
#   ./deploy.sh "fix slot rendering"  # use a custom commit message

set -e
cd "$(dirname "$0")"

if [ -z "$(git status --porcelain)" ]; then
  echo "✅ No local changes — nothing to deploy."
  echo "Latest deployed commit:"
  git log --oneline -1
  exit 0
fi

# Use provided message or generate one from changed files
if [ -n "$1" ]; then
  MSG="$1"
else
  CHANGED=$(git status --porcelain | awk '{print $2}' | head -5 | xargs)
  MSG="Update: $CHANGED"
fi

echo "📝 Commit message: $MSG"
echo "📤 Files changed:"
git status --short

echo ""
read -p "Deploy? [Y/n] " CONFIRM
CONFIRM=${CONFIRM:-Y}
if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 0
fi

git add -A
git commit -m "$MSG"
git push

echo ""
echo "✅ Pushed! GitHub Actions is now building..."
echo "🔗 Watch progress: https://github.com/dkotsergeev/minecraft-ui-builder/actions"
echo "🌐 Site URL:       https://dkotsergeev.github.io/minecraft-ui-builder/"
echo ""
echo "Usually live in ~1 minute."
