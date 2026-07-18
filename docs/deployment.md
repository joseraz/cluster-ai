# Deployment Setup

## Recommended Stack

- Hosting: Vercel
- Database: Supabase Postgres
- Authentication: Supabase Auth with Google OAuth
- Local development database: SQLite through Drizzle
- API boundary: Hono

## Environments

| Environment | Hosting | Database | Auth | Data |
|---|---|---|---|---|
| Development | Local Vite + Hono | Local SQLite, optional Supabase dev project | Supabase dev OAuth app | Local/test only |
| Staging | Vercel Preview or `staging` environment | Supabase staging project | Supabase staging OAuth app | Synthetic/non-production |
| Production | Vercel Production | Supabase production project | Supabase production OAuth app | Real client data |

## Required Variables

Public browser variables:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_ENV`
- `VITE_ELEVENLABS_API_KEY`

Server-only variables:

- `APP_ENV`
- `APP_ORIGIN`
- `API_PORT`
- `CLUSTER_DB_PATH`
- `SUPABASE_URL`
- `SUPABASE_JWT_SECRET`
- `AUTH_JWT_ISSUER`
- `AUTH_JWT_AUDIENCE`

Testing-only variables:

- `AUTH_ALLOW_TEST_TOKENS=true`
- `AUTH_TEST_JWT_SECRET`

## Vercel Setup

1. Create separate Supabase projects for staging and production.
2. Configure Google as an OAuth provider in each Supabase project.
3. Add callback URLs for local, staging, and production origins.
4. Add environment variables to Vercel:
   - Production variables scoped to Production.
   - Staging variables scoped to a dedicated `staging` environment on Vercel Pro, or to Preview variables limited to the `staging` branch.
   - Development variables pulled locally with the Vercel CLI only when needed.
5. Run migrations against staging before promoting to production.

## Migration Policy

- Never run migrations against `data/cluster.db` as if it were production.
- Never seed staging or preview with real client contact data.
- Production migrations must be reviewed and applied with a rollback plan.
- Supabase production tables must enable RLS before launch.

## Deployment Validation

Run before promotion:

```bash
npm run test
npm run test:e2e
npm run build
```

For production, also verify:

- `/api/health` responds with the expected environment.
- Unauthenticated `/api/contacts` returns 401.
- A logged-in user can create and read only their own contacts.
- Google login callback and logout URLs are configured in Supabase.
