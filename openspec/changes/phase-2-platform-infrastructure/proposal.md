# Phase 2 Platform Infrastructure

## Problem

Cluster AI currently runs on a local SQLite database with unauthenticated Hono API routes. That is useful for Phase 1 iteration, but it cannot safely support high-net-worth users whose contacts and relationship data must be private, tenant-scoped, and deployable across development, staging, and production environments.

## Goals

- Choose a production database/auth/deployment architecture for Cluster AI.
- Introduce development, staging, and production environment contracts.
- Implement Google-based authentication.
- Enforce server-side authorization so users can access only their own contacts, node positions, clusters, and relationship data.
- Keep the frontend behind the existing Hono API boundary.
- Add tests for authentication, authorization, database tenancy, and deployment configuration.

## Non-Goals

- Complete the full Supabase/PostgreSQL migration in this change.
- Implement graph pathfinding or use the reserved `relationships` table in the UI.
- Build organization/team account membership.
- Add non-Google login providers.
- Replace the existing React Router or ContactsContext architecture.

## Affected Capabilities

- `platform-infrastructure`: production database recommendation, deployment contract, environment validation, and ADR.
- `authentication`: login flow, protected app routes, JWT verification, and per-user authorization boundaries.

## Impacted Files

- `docs/adr/0001-platform-foundation.md`
- `docs/deployment.md`
- `.env.local` documentation
- `package.json`
- `server/app.ts`
- `server/auth/*`
- `server/db/schema.ts`
- `server/db/migrations/*`
- `server/routes/*`
- `server/tests/*`
- `src/auth/*`
- `src/api/*`
- `src/App.tsx`
- `src/main.tsx`
- `src/pages/Login.tsx`
- `src/components/layout/AppSidebar.tsx`
- `vite.config.ts`
