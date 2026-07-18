# Delta Spec: authentication

## ADDED Requirements

### Requirement: Google login
The app SHALL support Google login through the selected identity provider.

WHEN an unauthenticated user opens `/app/*`
THEN they SHALL be redirected to `/login`.

WHEN the user chooses "Continue with Google"
THEN the app SHALL initiate a Google OAuth login flow.

### Requirement: Authenticated API access
Tenant-owned API routes SHALL require a valid bearer token.

WHEN a request to contacts, clusters, or node positions has no bearer token or an invalid bearer token
THEN the API SHALL return 401 and SHALL NOT read or mutate tenant data.

### Requirement: Per-user authorization
Users SHALL only access their own account, contacts, relationship data, clusters, and node-position data.

WHEN user A creates tenant-owned data
THEN user B SHALL NOT see, update, delete, or attach UI state to that data through the API.

WHEN a tenant-owned row is created
THEN its owner SHALL be derived from the verified token, never trusted from the request body.
