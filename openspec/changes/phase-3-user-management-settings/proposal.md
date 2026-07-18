# Phase 3 User Management & Settings

## Problem

Cluster AI now has authenticated, tenant-scoped infrastructure, but all authenticated users are treated the same and there is no account profile surface. The product needs a small, secure user-management foundation before privileged support workflows, admin-only tools, or long-lived customer account preferences can be added safely.

## Goals

- Introduce role-based access control with `super_admin` and `standard_user` roles.
- Persist user profiles with configurable first name, last name, and location.
- Allow Super Admins to view and manage users.
- Implement secure, explicit, auditable user impersonation for support/debugging.
- Make impersonation state unmistakable in the app shell.
- Ensure impersonation cannot elevate permissions.
- Add server permission, role, impersonation, and settings tests.
- Add UI component tests and Storybook coverage for the new user-management surfaces.

## Non-Goals

- Build organization/team account membership.
- Build billing, subscription, or entitlement management.
- Build a full notification-delivery system beyond permission-ready API affordances.
- Replace Supabase Auth or move user identity out of the existing auth boundary.
- Implement graph pathfinding or social-introduction workflows.

## Affected Capabilities

- `user-management`: role model, admin user list/manage endpoints, permission checks, impersonation sessions, audit events.
- `settings`: profile read/update API and frontend settings page.

## Impacted Files

- `server/db/schema.ts`
- `server/db/migrations/*`
- `server/auth/*`
- `server/routes/*`
- `server/tests/*`
- `src/auth/*`
- `src/api/*`
- `src/components/layout/AppSidebar.tsx`
- `src/components/settings/*`
- `src/components/admin/*`
- `src/pages/SettingsView.tsx`
- `src/App.tsx`
- `src/stories/*`
- `openspec/changes/phase-3-user-management-settings/*`
