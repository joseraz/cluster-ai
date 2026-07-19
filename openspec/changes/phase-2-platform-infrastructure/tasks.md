# Tasks: phase-2-platform-infrastructure

## 1. Architecture
- [x] 1.1 Review current SQLite/Hono/Drizzle setup
- [x] 1.2 Research Supabase, PostgreSQL/Neon, Firebase, PlanetScale, and adjacent options
- [x] 1.3 Write ADR with database recommendation and deployment architecture
- [x] 1.4 Document development, staging, and production setup

## 2. Tests first
- [x] 2.1 Add auth middleware tests for 401/valid JWT behavior
- [x] 2.2 Add authorization tests for per-user contact isolation
- [x] 2.3 Add database schema tests for tenant ownership columns
- [x] 2.4 Add deployment config validation tests

## 3. Backend implementation
- [x] 3.1 Add auth config, JWT verification, and test-token support
- [x] 3.2 Add `user_id` columns and migration
- [x] 3.3 Scope contacts routes by authenticated user
- [x] 3.4 Scope node-position routes by authenticated user and contact ownership
- [x] 3.5 Scope cluster routes by authenticated user
- [x] 3.6 Update health/deployment metadata

## 4. Frontend implementation
- [x] 4.1 Add Supabase client/auth provider
- [x] 4.2 Protect `/app/*` routes
- [x] 4.3 Implement Google login/logout flow
- [x] 4.4 Attach bearer token to API calls
- [x] 4.5 Update sidebar/account affordance

## 5. Verification
- [x] 5.1 Run `npm run test`
- [x] 5.2 Run `npm run test:e2e`
- [x] 5.3 Run `npm run build`

## 6. Supabase local integration verification
- [x] 6.1 Apply `docs/supabase-schema.sql` in Supabase SQL Editor and confirm tables exist.
- [x] 6.2 Use Google login at `http://localhost:8082/app/network` with `VITE_AUTH_DEV_BYPASS=false`.
- [x] 6.3 Verify `/api/health` reports `db: "supabase"` when `SUPABASE_DB_ENABLED=true`.
- [x] 6.4 Verify JWT auth uses JWKS with issuer `<SUPABASE_URL>/auth/v1`; do not use `<SUPABASE_URL>/rest/v1`.
- [x] 6.5 Verify first authenticated requests create/read `user_profiles` without duplicate-key races.
- [x] 6.6 Create a contact in the app and confirm a row appears in Supabase `contacts`.
- [x] 6.7 Confirm the contact's relationship context appears in `relationship_stories`.
- [x] 6.8 Drag the contact node and confirm a row appears in `node_positions`.
