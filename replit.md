# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Client portal for a freelance design business.

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
- **Frontend**: React + Vite, TanStack Query, wouter, shadcn/ui, Tailwind CSS

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

- **Client Portal** (`artifacts/client-portal/`) — React + Vite frontend, preview path `/`
- **API Server** (`artifacts/api-server/`) — Express 5 backend, served at `/api`

## Features

- Dashboard with project stats, pipeline visualization, and recent activity feed
- Projects list with search, status/type filters, and priority indicators
- New request submission form for clients (name, email, project details, budget, deadline)
- Project detail view with status management, comments thread, and file tracking

## DB Schema

Tables in `lib/db/src/schema/projects.ts`:
- `projects` — main project requests
- `project_files` — uploaded files for each project
- `comments` — client/designer discussion threads
- `activity` — audit log of all project events

## API Routes (in `artifacts/api-server/src/routes/projects.ts`)

- `GET/POST /api/projects` — list and create projects
- `GET/PATCH/DELETE /api/projects/:id` — project CRUD
- `POST /api/projects/:id/files` — attach files
- `GET/POST /api/projects/:id/comments` — comment thread
- `GET /api/dashboard/stats` — summary stats
- `GET /api/dashboard/activity` — recent activity feed

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
