# Design

## Data Model

Add `user_profiles` as the application-owned companion to Supabase Auth users. The `id` matches the verified auth subject. It stores role, email, first name, last name, location, and timestamps. Legacy username/display-name/profile-note columns may exist in local SQLite migrations, but Phase 3 no longer exposes or writes them.

Add `impersonation_sessions` for explicit support sessions. Each row stores the admin id, target user id, reason, status, timestamps, and an optional end timestamp.

Add `audit_events` for security-relevant actions. Phase 3 records impersonation start/end and admin user-management updates. The schema is intentionally generic enough for future notification and settings audit events.

## Roles And Permissions

Roles are narrow and server-enforced:

- `super_admin`: can view/manage users, send notifications when the notification surface exists, and start/end impersonation.
- `standard_user`: can manage their own account and access their own network only.

The API derives role from `user_profiles`, never request bodies or client state. Missing profiles are lazily created as `standard_user`, except ids configured in `SUPER_ADMIN_USER_IDS`, which are promoted to `super_admin` at profile creation or request-time sync.

## Effective User And Impersonation

`requireUser` continues to authenticate the actor from the bearer token. It then loads the actor profile and, when an `X-Cluster-Impersonate-User` header is present, requires the actor to have `impersonate_users` permission before switching tenant access to the target user.

The authenticated context includes:

- `actor`: the real authenticated user and role.
- `effectiveUser`: the user whose tenant data is being accessed.
- `impersonation`: active session metadata when impersonating.

Routes that operate on tenant data use `effectiveUser.id`. Admin routes use `actor`.

Impersonation sessions are auditable and cannot elevate permissions: permission checks always evaluate the `actor`, not the target user, for admin abilities. The UI gets explicit impersonation metadata from `/api/me` and shows a persistent banner with a stop action.

## API Surface

- `GET /api/me`: current actor, effective profile, role, permissions, and impersonation metadata.
- `PATCH /api/me/profile`: update own/effective profile settings fields.
- `GET /api/admin/users`: super-admin-only user list.
- `PATCH /api/admin/users/:id`: super-admin-only profile/role management.
- `POST /api/admin/impersonations`: super-admin-only start; requires target user and reason.
- `DELETE /api/admin/impersonations/current`: end the active impersonation context.

## Frontend

`AuthProvider` loads `/api/me` after auth/dev-bypass is ready and exposes the profile, role, permissions, impersonation state, profile refresh, and stop impersonation action.

The Settings page is modular:

- Profile panel for first name, last name, and location.
- Admin panel only for Super Admins, with user list, role management, and impersonation start controls.

`AppSidebar` links to Settings and shows role/account context. A global impersonation banner appears above app content while active.

## Testing Strategy

Use TDD at the API boundary first:

- role/profile creation and super-admin bootstrap tests;
- permission denial tests for standard users;
- admin user-management tests;
- impersonation start/end, tenant access, audit, and non-elevation tests;
- settings profile read/update tests.

Add focused React component tests for Settings and impersonation banner using Vitest/jsdom. Add Storybook stories for Settings sections and impersonation banner states.
