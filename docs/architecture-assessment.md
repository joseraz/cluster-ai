# Cluster AI Architecture Assessment

Date: 2026-07-18

## Executive Summary

Cluster AI is a Vite/React application with a local Hono API and SQLite persistence. The current system is appropriate for a Phase 1 single-user trust-network visualization, with clean enough data flow for contact CRUD and an intentionally local-first database posture. The biggest architectural risks are not framework choice; they are missing foundations around auth isolation, design-system enforcement, graph relationship semantics, and the large `OrbitalCanvas` component.

## Frontend Architecture

- React 18 + TypeScript + Vite SWC, with `@/` path alias.
- Routing is handled by React Router v6. `/app/*` renders the authenticated-looking shell, but routes are not currently gated.
- App state is mostly context over TanStack React Query: `ContactsContext`, `SearchContext`, `ThemeContext`, and `ContactsPanelContext`.
- Contact data flows through thin fetch wrappers in `src/api/*` to `/api/*` endpoints.
- UI is shadcn/Radix plus Tailwind CSS variables. Several product components still use inline styles because the orbital/network UI predates stricter token enforcement.
- The network visualization is a custom SVG `OrbitalCanvas`, which avoids a heavy graph dependency but currently mixes rendering, animation, drag persistence, search layout, and tooltip behavior in one file.

## Backend Architecture

- Hono powers the API, mounted from `server/app.ts`; `server/index.ts` only serves the app.
- API routers are split by resource: contacts, clusters, and node positions.
- Migrations run on app import, which keeps local dev simple but should be revisited before multi-tenant or serverless deployment.
- The Vite dev server proxies `/api` to the Hono API port, so frontend code can fetch relative API paths.

## Database Model

- SQLite is accessed through Drizzle ORM and `better-sqlite3`.
- `contacts` is the primary Phase 1 table and intentionally denormalizes connection fields for simpler reads.
- `relationships` exists as the future graph edge table but is not yet used by routes.
- `clusters` and `cluster_members` are DB-ready but not exposed in the UI.
- `node_positions` stores UI-only orbital state and is cleaned up manually when contacts are deleted.
- Real client data is intended to live in `data/cluster.db`, which tests avoid through `CLUSTER_DB_PATH`.

## Authentication Approach

- Auth0 React is installed and login UI references Auth0, but login actions are stubs that redirect directly to `/app/network`.
- `/app/*` routes are open. No user identity is attached to contacts, relationships, clusters, or node positions yet.
- The schema includes comments for future `userId`, but there is no tenant boundary.

## Deployment Setup

- The repository has development, build, preview, API, test, and e2e scripts.
- Production build currently covers the frontend only (`vite build`).
- There is no documented deploy target, API hosting strategy, secrets strategy, or migration execution strategy beyond local SQLite and the Supabase migration note.

## Component System

- shadcn/Radix primitives provide the reusable base layer.
- Product-level components exist for network search, filters, contact creation/editing, Mr. Fox, sidebar navigation, and pages.
- Storybook was missing before this phase, so reusable UI had no isolated development or visual review harness.
- Component reuse expectations live in prose, not in a structured configuration that can be imported by tools or rendered in Storybook.

## Testing Framework

- Vitest covers API contact CRUD using Hono `app.request()` and in-memory SQLite.
- Playwright covers the contact CRUD flow on isolated UI/API ports with `data/e2e.db`.
- The test separation protects real local data.
- Unit tests are currently missing for important frontend utilities such as search, parsing, and design-system enforcement.

## Technical Debt and Risks

- `OrbitalCanvas` is too large and owns too many concerns; significant canvas work should begin with an OpenSpec proposal.
- Auth is not enforced, and persistence has no user boundary.
- The `relationships` table is unused, leaving the core trust-routing model deferred.
- Storybook and visual regression foundations were missing.
- Design-system rules are partially enforced by convention only; raw colors still exist in several legacy inline-style surfaces.
- The ElevenLabs agent ID is hardcoded and should move to environment configuration.
- Migration-on-import is convenient locally but can surprise production/serverless runtimes.

## Missing Foundations

- Auth route gating and tenant-aware data model.
- Storybook-driven UI development and review.
- A structured AI/contributor guidance mechanism.
- Explicit API/deployment architecture for production.
- Unit tests for frontend utilities and design-system conventions.
- Mock boundaries for API, voice, and graph-heavy components in isolated UI harnesses.

## Refactoring Candidates

- Split `OrbitalCanvas` into rendering, geometry/layout, drag persistence, search-grid animation, and tooltip modules.
- Normalize graph relationships once warm-introduction pathfinding begins.
- Extract app shell providers into reusable test/story wrappers.
- Move Mr. Fox agent configuration to environment variables.
- Replace legacy inline colors in non-canvas components with Tailwind tokens where feasible.

