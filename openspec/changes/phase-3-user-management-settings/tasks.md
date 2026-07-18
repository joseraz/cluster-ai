# Tasks: phase-3-user-management-settings

## 1. OpenSpec
- [x] 1.1 Inspect current auth, tenancy, Storybook, and test setup
- [x] 1.2 Write proposal, design, tasks, and delta specs

## 2. Tests first
- [x] 2.1 Add role/profile API tests
- [x] 2.2 Add permission tests for standard-user denial and super-admin access
- [x] 2.3 Add impersonation tests for explicit permission, audit, visibility, and non-elevation
- [x] 2.4 Add settings API tests
- [x] 2.5 Add UI component tests for settings and impersonation states

## 3. Backend implementation
- [x] 3.1 Add user profile, impersonation session, and audit event schema/migration
- [x] 3.2 Add role/permission helpers and enriched auth context
- [x] 3.3 Add `/api/me` and profile update routes
- [x] 3.4 Add admin user-management routes
- [x] 3.5 Add impersonation start/end routes and audit logging
- [x] 3.6 Update tenant routes to use effective user while preserving actor permissions

## 4. Frontend implementation
- [x] 4.1 Extend auth context with profile, role, permissions, and impersonation state
- [x] 4.2 Add settings API client
- [x] 4.3 Add Settings page and modular settings panels
- [x] 4.4 Add admin user-management panel
- [x] 4.5 Add persistent impersonation banner and stop action
- [x] 4.6 Register Settings route/sidebar affordances

## 5. Storybook
- [x] 5.1 Add stories for profile settings panel
- [x] 5.2 Add stories for admin user-management panel
- [x] 5.3 Add stories for impersonation banner

## 6. Verification
- [x] 6.1 Run `npm run test`
- [x] 6.2 Run `npm run build-storybook`
- [x] 6.3 Run `npm run build`
- [x] 6.4 Run `npm run test:e2e`
