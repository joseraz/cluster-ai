# ADR 0001: Platform Foundation

Date: 2026-07-18

## Status

Accepted

## Decision

Cluster AI will use **Supabase** as the production platform foundation: managed PostgreSQL, Supabase Auth with Google OAuth, Row Level Security, Realtime, backups, and operational dashboarding. The app will deploy to **Vercel**, preserving the existing Hono API as the server-side application boundary.

For Phase 2 implementation, local development and automated tests continue to run on SQLite via Drizzle. The schema now includes tenant ownership columns that map directly to production Postgres/RLS policies.

## Options Considered

| Option | Strengths | Weaknesses | Decision |
|---|---|---|---|
| Supabase | Managed Postgres, Auth, Google OAuth, RLS, Realtime, dashboard, Vercel integration, low operational overhead | Platform coupling; free tier can pause; careful RLS policy review required | Recommended |
| Neon + separate auth | Excellent serverless Postgres, branching, Vercel-native preview workflows, strong Drizzle fit | Requires separate auth and app-managed authorization; realtime/user management are not bundled | Runner-up |
| Self-managed PostgreSQL | Maximum control and portability | Too much operational burden for a small premium product team | Defer |
| Firebase | Excellent auth/realtime and generous operational tooling | Firestore document model and rules are less natural for trust graph queries and SQL migrations | Reject |
| PlanetScale | Strong serverless MySQL/Vitess and Vercel integration | MySQL rather than Postgres; no native RLS equivalent; weaker fit for planned graph/JSON/query needs | Reject |
| Neo4j Aura/FalkorDB | Purpose-built graph traversal | Premature as the primary source of truth before product graph workflows are proven | Future adjunct |

## Rationale

Cluster AI needs secure multi-user data boundaries before it needs exotic scale. Supabase gives the fastest path to a production-grade foundation because authentication, relational storage, realtime updates, and database-enforced authorization live in one coherent platform. That matters for a product where contact data is sensitive and trust is the core promise.

Postgres also preserves a clear future path for GraphRAG: relationship tables can support initial traversal and can later feed Neo4j Aura, FalkorDB, or another graph database if pathfinding workloads outgrow SQL.

## Deployment Architecture

- **Development**: local Vite + Hono + SQLite. Developers may connect to a Supabase development project for OAuth callback testing.
- **Staging**: Vercel Preview or dedicated Vercel `staging` environment, separate Supabase project, non-production secrets, non-production data.
- **Production**: Vercel Production, production Supabase project, production Google OAuth client, production secrets only.

## Security Model

- Browser obtains a Supabase Auth session through Google OAuth.
- Browser sends the access token to Hono as `Authorization: Bearer <jwt>`.
- Hono verifies the token and derives `userId` from the JWT subject.
- Tenant-owned rows include `user_id`.
- API queries scope every read/write by `user_id`.
- Production Supabase tables must additionally enable RLS policies using `auth.uid()`.

## Migration Strategy

1. Keep SQLite for local development and tests.
2. Add `user_id` ownership columns locally and in tests.
3. Create equivalent Supabase PostgreSQL migrations before production launch.
4. Enable RLS and owner policies for contacts, relationships, node positions, clusters, and cluster members.
5. Run migrations in staging first, validate, then promote to production.

## Remaining Risks

- RLS policies need independent review before storing real client data in production.
- Staging/preview branches must never receive production contact data.
- Auth token verification must be configured with production issuer/audience values before launch.
- A future organization/team model will need explicit membership tables and policy changes.
