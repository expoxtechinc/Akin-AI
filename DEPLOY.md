# AkinAI — Deployment Guide

Built by **Akin S. Sokpah** (Liberia). Powered by **Google Gemini** via Google AI Studio.

This guide walks you through pushing the code to GitHub and deploying it to Vercel.

---

## ⚠️ STEP 0 — Revoke the leaked GitHub token (do this first)

The token `ghp_URAH...` you pasted in chat is now permanently exposed. Anyone who sees that conversation could push, delete, or wipe your repos.

1. Go to https://github.com/settings/tokens
2. Find the token and click **Delete** (or **Revoke**).
3. Generate a new one: **Generate new token (classic)** → tick the **`repo`** scope → copy it once and store it safely (a password manager).

---

## STEP 1 — Push to GitHub

The repo lives at: https://github.com/expoxtechinc/Akin-AI

In the Replit **Shell** (bottom panel), run these commands one block at a time:

```bash
# Initialize git (only if .git is missing)
git init -b main

# Identify yourself (use your GitHub email)
git config user.name "Akin S. Sokpah"
git config user.email "you@example.com"

# Stage everything
git add .

# Commit
git commit -m "Initial AkinAI release"

# Connect the GitHub remote
git remote add origin https://github.com/expoxtechinc/Akin-AI.git

# Push
git push -u origin main
```

When git asks for **Password**, paste the **new** Personal Access Token (not your GitHub password). Username is your GitHub username (`expoxtechinc`).

If `git remote add origin` says "remote origin already exists", run:

```bash
git remote set-url origin https://github.com/expoxtechinc/Akin-AI.git
```

---

## STEP 2 — Deploy to Vercel

Everything is pre-configured. Vercel will build the Expo web app and run the chat / scholarships / inspire endpoints as serverless functions on the same domain.

### 2a. Import the repo

1. Go to https://vercel.com/new
2. Sign in with GitHub if needed.
3. Click **Import** next to `expoxtechinc/Akin-AI`.
4. **Framework Preset:** leave as **Other**.
5. **Root Directory:** leave as `./` (the repo root).
6. **Build & Output Settings:** leave blank — they're loaded from `vercel.json`.
7. Don't click Deploy yet — set the environment variable first (next step).

### 2b. Add the Gemini API key

1. Scroll down to **Environment Variables** on the import screen (or after import: **Project Settings → Environment Variables**).
2. Add:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** your key from https://aistudio.google.com/app/api-keys
   - **Environments:** check Production, Preview, **and** Development.
3. Click **Save**.

### 2c. Deploy

1. Click **Deploy** (or, if the project already exists: **Deployments → Redeploy** so the new env var takes effect).
2. First build takes ~3–5 minutes (installs pnpm workspace, runs codegen, exports the Expo web bundle).
3. When it finishes you'll get a URL like `https://akin-ai.vercel.app`.

### 2d. Verify it works

Open these in your browser:

- `https://YOUR-URL.vercel.app/` — the AkinAI app loads
- `https://YOUR-URL.vercel.app/api/healthz` — should return `{"status":"ok"}`
- `https://YOUR-URL.vercel.app/api/scholarships` — should return the 12-item list
- `https://YOUR-URL.vercel.app/api/inspire` — should return today's quote + tip + prompts

Then in the app, send a chat message. If you get a reply, Gemini is wired up correctly.

---

## What's deployed

| Path | What it serves |
|------|----------------|
| `/` | The AkinAI mobile-style web app (Expo Router web export) |
| `/api/chat` | POST → proxies to Google Gemini (`gemini-flash-latest`) |
| `/api/scholarships` | GET → curated scholarships list |
| `/api/inspire` | GET → daily quote + study tip + prompts |
| `/api/healthz` | GET → health check |

The mobile app calls these as **same-origin** requests (no CORS, no leaked keys). The Gemini key lives only on Vercel as an environment variable — never in the client bundle.

---

## Common problems

**"Build failed: pnpm install error"**
Vercel detects pnpm from `pnpm-lock.yaml`. If it doesn't, set Node Version to 20 and Install Command to `pnpm install --no-frozen-lockfile` in Project Settings.

**"Chat returns 500"**
The `GEMINI_API_KEY` env var is missing or has the wrong value. Re-check Settings → Environment Variables, then redeploy.

**"App loads but is blank"**
Hard-refresh the browser (Ctrl/Cmd + Shift + R). Vercel's CDN sometimes caches the previous version for a minute.

**"App calls localhost or fails on /api/*"**
The `setBaseUrl("")` (relative URLs) is automatic when `EXPO_PUBLIC_DOMAIN` is unset. Make sure you did NOT add `EXPO_PUBLIC_DOMAIN` as a Vercel env var.

---

## Updating the app

After the first deploy, every `git push` to `main` triggers an automatic Vercel deployment. To make changes:

```bash
# Edit files in Replit
git add .
git commit -m "Describe your change"
git push
```

Watch the build at https://vercel.com/dashboard.
