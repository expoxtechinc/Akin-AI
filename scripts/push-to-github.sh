#!/usr/bin/env bash
# Push the AkinAI repo to https://github.com/expoxtechinc/Akin-AI
# Uses GITHUB_TOKEN and GITHUB_USERNAME from Replit Secrets.
# Run from the project root:   bash scripts/push-to-github.sh

set -euo pipefail

TOKEN="${GITHUB_PERSONAL_ACCESS_TOKEN:-${GITHUB_TOKEN:-}}"

if [ -z "$TOKEN" ] || [ -z "${GITHUB_USERNAME:-}" ]; then
  echo "ERROR: GITHUB_PERSONAL_ACCESS_TOKEN (or GITHUB_TOKEN) and GITHUB_USERNAME must be set in Replit Secrets."
  exit 1
fi

REPO_URL="https://${GITHUB_USERNAME}:${TOKEN}@github.com/expoxtechinc/Akin-AI.git"

# Clear any leftover git locks from interrupted operations
rm -f .git/index.lock .git/config.lock .git/HEAD.lock 2>/dev/null || true

# Set identity if not already configured
git config user.name  >/dev/null 2>&1 || git config user.name  "Akin S. Sokpah"
git config user.email >/dev/null 2>&1 || git config user.email "akin@expoxtech.local"

# Make sure we're on main
git branch -M main 2>/dev/null || true

# Stage and commit any uncommitted changes (no-op if clean)
git add -A
git diff --cached --quiet || git commit -m "Sync latest changes from Replit"

# Add or update the origin remote (without printing the token)
if git remote get-url origin >/dev/null 2>&1; then
  git remote set-url origin "$REPO_URL"
else
  git remote add origin "$REPO_URL"
fi

echo "Pushing to expoxtechinc/Akin-AI ..."
git push -u origin main

# Scrub the token out of the remote URL on disk so it's not stored in plaintext
git remote set-url origin "https://github.com/expoxtechinc/Akin-AI.git"

echo ""
echo "Done. Your code is now at https://github.com/expoxtechinc/Akin-AI"
echo "Next: import the repo at https://vercel.com/new and add GEMINI_API_KEY as an env var."
