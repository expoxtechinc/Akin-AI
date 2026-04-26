# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## AkinAI artifact

Mobile-first Expo app at `artifacts/akin-ai/` (4 tabs: Chat, Scholarships, Inspire, Profile).
Built by Akin S. Sokpah (Liberia). Powered by Google Gemini via Google AI Studio.

- Backend (Replit dev): Express routes in `artifacts/api-server/src/routes/` (`chat.ts`, `scholarships.ts`, `inspire.ts`).
- Backend (Vercel prod): mirror serverless functions in `/api/*.ts` at the repo root.
- Required env var: `GEMINI_API_KEY` (Replit Secrets locally, Vercel Project Env Vars in prod).
- Gemini model: `gemini-flash-latest`.
- Deployment guide: `DEPLOY.md`.
- Vercel config: `vercel.json` (builds Expo web export to `artifacts/akin-ai/dist`).
