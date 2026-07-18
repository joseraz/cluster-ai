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
