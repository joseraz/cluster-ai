# Delta Spec: platform-infrastructure

## ADDED Requirements

### Requirement: Production platform decision
The repository SHALL contain an architecture decision record that recommends the production database, authentication, and deployment architecture for Cluster AI.

WHEN the ADR compares Supabase, PostgreSQL/Neon, Firebase, PlanetScale, and other suitable options
THEN it SHALL evaluate scalability, simplicity, cost, Vercel compatibility, authentication support, realtime support, developer experience, and suitability for trust-network data.

### Requirement: Environment separation
The platform SHALL define development, staging, and production environments with separate database credentials, auth configuration, and application origins.

WHEN a deployment environment is missing required secrets or public client values
THEN validation SHALL fail before the app is considered deployable.

### Requirement: Migration path
The platform SHALL document how database migrations are applied in development, staging, and production.

WHEN production database changes are prepared
THEN the migration path SHALL protect real client data and avoid using local SQLite files as production storage.

### Requirement: Supabase auth verification
The API SHALL verify Supabase Auth access tokens with the Supabase JWKS endpoint rather than relying on the legacy JWT secret.

WHEN `SUPABASE_JWKS_URL` is blank or omitted
THEN the API SHALL derive the JWKS URL from `SUPABASE_URL` as `<SUPABASE_URL>/auth/v1/.well-known/jwks.json`.

WHEN validating Supabase access tokens
THEN the expected issuer SHALL be `<SUPABASE_URL>/auth/v1` and the audience SHALL default to `authenticated`.

### Requirement: Supabase database write path
The API SHALL support a Supabase-backed data path for authenticated local and deployed environments.

WHEN `SUPABASE_DB_ENABLED=true`
THEN authenticated API requests SHALL read and write Supabase tables for profiles, contacts, relationship stories, node positions, and clusters.

WHEN a user makes their first authenticated request
THEN profile creation SHALL be idempotent so concurrent startup requests do not fail with duplicate `user_profiles` primary keys.

WHEN a contact is created through the app
THEN the API SHALL write the contact to `contacts` and relationship context to `relationship_stories` for the authenticated user.

WHEN a contact node is dragged on the canvas
THEN the API SHALL write the saved position to `node_positions` for the authenticated user.
