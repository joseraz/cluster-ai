# Tasks: contact-edit-delete-and-crud-tests

## 1. Update path
- [x] 1.1 Rename `CreateContactSheet.tsx` → `ContactSheet.tsx`; add `contact?: Contact | null` prop, `isEdit` branching (prefill reset, header copy, footer buttons, `handleSave`)
- [x] 1.2 OrbitalCanvas: `onEditContact` prop + pencil button on node hover card (clears hover refs on click)
- [x] 1.3 NetworkView: `editingContact` state wired to canvas + sheet
- [x] 1.4 ContactsView: import rename (stays create-only)
- [x] 1.5 Manual browser verification of edit flow

## 2. Delete path
- [x] 2.1 `DELETE /api/contacts/:id`: 404 on unknown id, delete contact's `node_positions` row
- [x] 2.2 ContactSheet: Delete button → destructive confirmation Dialog → `deleteContact`
- [x] 2.3 Manual browser verification of delete flow

## 3. API regression tests
- [x] 3.1 Extract `server/app.ts` (app exported); `server/index.ts` = serve() + `API_PORT`
- [x] 3.2 `server/db/client.ts`: `CLUSTER_DB_PATH` env override
- [x] 3.3 POST validation: 400 when firstName/lastName missing
- [x] 3.4 `vitest.config.ts` + `server/tests/contacts.api.test.ts` (lifecycle, validation, position cleanup)
- [x] 3.5 `npm run test` green

## 4. E2E regression tests
- [x] 4.1 Parameterize vite proxy target via `API_PORT`
- [x] 4.2 OrbitalCanvas test ids (node group, hover card, spin buttons)
- [x] 4.3 `playwright.config.ts` + `e2e/global-setup.ts` (isolated DB/ports)
- [x] 4.4 `e2e/contact-crud.spec.ts` (create, edit, delete)
- [x] 4.5 `npm run test:e2e` green

## 5. Make the suite permanent
- [x] 5.1 package.json scripts (`test`, `test:watch`, `test:e2e`, `test:all`)
- [x] 5.2 CLAUDE.md: commands, standing test rule, Known Debt + rename updates
- [x] 5.3 Final manual CRUD acceptance pass in browser
