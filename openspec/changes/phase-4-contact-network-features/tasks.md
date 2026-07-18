# Tasks: phase-4-contact-network-features

## 1. OpenSpec
- [x] 1.1 Inspect current contact API, DB schema, orbital UI, Storybook, and tests
- [x] 1.2 Write proposal, design, tasks, and delta specs

## 2. Tests first
- [x] 2.1 Add API tests for contact limit and tenant isolation
- [x] 2.2 Add API/database tests for relationship stories and delete cascade
- [x] 2.3 Add milestone utility tests
- [x] 2.4 Add UI component tests for progress and story inputs
- [x] 2.5 Add E2E coverage for hidden create affordance and story editing

## 3. Backend implementation
- [x] 3.1 Add configurable contact limit
- [x] 3.2 Add relationship-stories schema and migration
- [x] 3.3 Return relationship stories with contact list/detail payloads
- [x] 3.4 Accept story arrays on create/update while preserving `howWeMet` compatibility
- [x] 3.5 Enforce contact limit on create

## 4. Frontend implementation
- [x] 4.1 Extend contact types and API error handling
- [x] 4.2 Add milestone/progress utilities and component
- [x] 4.3 Render progress at top-left of orbital visualization
- [x] 4.4 Hide create-contact affordances at the contact limit
- [x] 4.5 Replace single story field with editable multiple relationship stories

## 5. Storybook
- [x] 5.1 Add stories for network progress
- [x] 5.2 Add stories for relationship-story inputs

## 6. Verification
- [x] 6.1 Run `npm run test`
- [x] 6.2 Run `npm run build-storybook`
- [x] 6.3 Run `npm run build`
- [x] 6.4 Run `npm run test:e2e`
