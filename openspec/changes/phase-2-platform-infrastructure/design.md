# Design

## Architecture Decision

Use **Supabase** for production platform infrastructure: managed PostgreSQL, Supabase Auth with Google OAuth, Row Level Security, Realtime, backups, dashboard operations, and future storage/edge-function support. Deploy the frontend and Hono API to **Vercel**.

The existing Hono API remains the application boundary. The browser authenticates with Supabase Auth, sends the access token as `Authorization: Bearer <jwt>`, and the API verifies the JWT before touching user data. Local development and tests continue to use SQLite, now with `user_id` columns that mirror the production PostgreSQL/RLS model.

## Vendor Evaluation Summary

| Option | Fit | Notes |
|---|---|---|
| Supabase | Recommended | Best combined fit for Postgres, Google auth, RLS, realtime, Vercel env sync, and developer speed. |
| Neon | Strong runner-up | Excellent serverless Postgres and preview branches; requires separate auth and application-managed authorization. |
| PostgreSQL self-managed | Deferred | Maximum control, but unnecessary operational burden for this phase. |
| Firebase | Not recommended | Strong auth/realtime, but document data model and security rules are a worse fit for relationship graph queries and SQL migrations. |
| PlanetScale | Not recommended | Scalable MySQL/Vitess and Vercel integration, but lacks native Postgres/RLS fit and adds friction for graph/JSON/query needs. |
| Other graph DBs | Future adjunct | Neo4j Aura/FalkorDB may become useful for trust-path traversal after Postgres-backed product flows are proven. |

## Environment Model

- Development: local Vite + Hono + SQLite with migrations; optional Supabase dev project for auth callback testing.
- Staging: Vercel Preview or dedicated `staging` environment, separate Supabase project/database, seeded non-production data only.
- Production: Vercel Production, separate Supabase project/database, production OAuth app, production secrets only.

Environment values are validated by a dedicated deployment config helper and documented in `docs/deployment.md`.

## Authentication

- Supabase Auth is the recommended identity provider.
- Google login is initiated through `signInWithOAuth({ provider: 'google' })`.
- `AuthProvider` listens for Supabase auth state changes and exposes session/loading/logout helpers.
- `/app/*` is protected in the browser; unauthenticated users are redirected to `/login`.
- API requests include the bearer token when a session is present.
- The Hono API verifies Supabase access tokens with the Supabase JWKS endpoint, not the legacy JWT secret. If `SUPABASE_JWKS_URL` is blank, the server derives it from `SUPABASE_URL` as `<SUPABASE_URL>/auth/v1/.well-known/jwks.json`.
- `AUTH_JWT_ISSUER` must point to the Supabase Auth issuer, `<SUPABASE_URL>/auth/v1`, not the REST API URL `<SUPABASE_URL>/rest/v1`.
- Blank optional env values must be treated as unset. This specifically matters for `SUPABASE_JWKS_URL=` in `.env.local`; an empty string must not be passed to `new URL()`.

## Authorization

- Every tenant-owned table gains `user_id TEXT NOT NULL`.
- API routes use `requireUser` middleware for contacts, clusters, and node positions.
- Reads are filtered by `user_id`.
- Creates stamp `user_id` from the verified token.
- Updates/deletes include both resource id and `user_id` in their `WHERE` clause.
- Node-position writes validate ownership of the related contact before upsert.

## Database And Migration Strategy

This change keeps SQLite for local/test execution and adds a migration that introduces `user_id` columns. The production PostgreSQL migration path is documented in the ADR/deployment guide:

- create equivalent Supabase tables with UUID/text user id columns;
- enable RLS in Supabase;
- add policies scoped to `auth.uid()`;
- run migrations per environment before deployment promotion.

The local Supabase integration uses `SUPABASE_DB_ENABLED=true` to route authenticated Hono API requests to Supabase tables while keeping SQLite available for local tests and legacy development. The server must create `user_profiles` idempotently with an upsert on first authenticated request, because the app can fire `/api/me`, `/api/contacts`, and `/api/node-positions` concurrently after login. A plain insert can race and fail with a duplicate primary key.

The verified Supabase write path is:

1. Google login creates a Supabase session.
2. The browser sends the Supabase access token to Hono as `Authorization: Bearer <jwt>`.
3. Hono verifies the token with JWKS and scopes the request to the JWT subject.
4. `GET /api/me` upserts/loads `user_profiles`.
5. Contact create writes `contacts`.
6. `howWeMet`/relationship context writes `relationship_stories`.
7. Canvas drag writes `node_positions`.

## Testing Strategy

- Add server auth tests covering missing, invalid, and valid bearer tokens.
- Add authorization tests proving cross-user read/update/delete access is blocked.
- Add DB tests proving tenant-owned tables include `user_id`.
- Add deployment config tests for development/staging/production environment validation.
- Keep the existing CRUD lifecycle green by sending test auth headers.
