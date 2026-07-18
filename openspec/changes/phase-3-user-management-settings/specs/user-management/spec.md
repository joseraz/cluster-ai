# Delta Spec: user-management

## ADDED Requirements

### Requirement: Application user profiles
The app SHALL maintain an application user profile for every authenticated user that reaches the API.

WHEN an authenticated user without an application profile calls an authenticated API route
THEN the API SHALL create a standard-user profile derived from the verified token subject and email.

WHEN the verified token subject is configured as a super-admin id
THEN the profile SHALL have the super-admin role.

### Requirement: Role-based permissions
The app SHALL enforce role-based permissions on the server.

WHEN a standard user calls an admin-only API route
THEN the API SHALL return 403.

WHEN a super admin calls an admin-only API route
THEN the API SHALL allow the action if request validation passes.

### Requirement: Admin user management
Super admins SHALL be able to view and manage application users.

WHEN a super admin requests the user list
THEN the API SHALL return application profiles for all users.

WHEN a super admin updates a user's role or profile metadata
THEN the API SHALL persist the update and record an audit event.

### Requirement: Secure impersonation
Super admins SHALL be able to impersonate users only through explicit, auditable sessions.

WHEN a standard user attempts to impersonate another user
THEN the API SHALL return 403 and SHALL NOT create an impersonation session.

WHEN a super admin starts impersonation without a target user id or reason
THEN the API SHALL return 400 and SHALL NOT create an impersonation session.

WHEN a super admin starts impersonation with a valid target user id and reason
THEN the API SHALL create an active impersonation session and record an audit event.

WHEN an authenticated request includes active impersonation context
THEN tenant-owned reads and writes SHALL use the target user as the effective user.

WHEN permission checks run during impersonation
THEN admin permissions SHALL be evaluated against the real actor, never the impersonated target.

### Requirement: Impersonation visibility
The app SHALL clearly expose active impersonation to the admin.

WHEN `/api/me` is called during impersonation
THEN the response SHALL include the actor profile, effective profile, and impersonation session metadata.

WHEN the frontend has active impersonation metadata
THEN it SHALL render a persistent banner naming the impersonated user and provide a stop action.
