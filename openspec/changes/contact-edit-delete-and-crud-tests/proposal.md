# Proposal: Contact Edit/Delete on the Orbital Canvas + CRUD Regression Tests

## Problem

The orbital visualisation supports only half of the contact CRUD lifecycle. Users can
create contacts (via the sheet) and read them (nodes + hover cards), but there is no way
to correct or enrich a contact's details, and no way to remove a contact at all. For a
premium service whose product *is* the accuracy of the client's trusted network, stale or
wrong contact data is a direct trust failure.

Separately, the project has **zero automated tests**. Contact CRUD is the bread and butter
of the platform — every future feature touches it — and today nothing prevents a
regression from shipping silently.

## What changes

1. **Update** — hovering a node shows a pencil affordance on the hover card; clicking it
   opens the existing contact sheet in edit mode ("Update Contact", prefilled, Save button)
   backed by the existing `PATCH /api/contacts/:id`.
2. **Delete** — in edit mode the sheet's footer offers Delete (replacing Cancel), guarded
   by a destructive confirmation modal; confirming removes the contact via
   `DELETE /api/contacts/:id`, which is hardened to 404 on unknown ids and to clean up the
   contact's orphaned `node_positions` row.
3. **Regression suite** — first automated tests:
   - Vitest API tests against the Hono app (`app.request()`) on an isolated in-memory DB
   - Playwright E2E tests driving the real UI (create via sheet, hover→edit→save,
     delete with confirmation) on an isolated test DB and dedicated ports
   - The suite becomes a standing requirement: it must pass before any feature is complete.

## Affected capabilities

- `contact-management` (new spec) — edit/delete behavior from the canvas
- `testing` (new spec) — CRUD regression suite requirement

## Impacted files

- `src/components/contacts/CreateContactSheet.tsx` → renamed `ContactSheet.tsx` (dual-mode)
- `src/components/network/OrbitalCanvas.tsx` (pencil button, `onEditContact` prop, test ids)
- `src/pages/NetworkView.tsx` (editing state), `src/pages/ContactsView.tsx` (import rename)
- `server/routes/contacts.ts` (DELETE hardening + cleanup, POST validation)
- `server/index.ts` → split into `server/app.ts` + entry (testability)
- `server/db/client.ts` (`CLUSTER_DB_PATH` env)
- New: `vitest.config.ts`, `server/tests/contacts.api.test.ts`, `playwright.config.ts`,
  `e2e/contact-crud.spec.ts`, `e2e/global-setup.ts`
- `package.json` (test scripts, vitest + @playwright/test devDeps), `CLAUDE.md`

## Out of scope

Auth/users/payments, edit access from ContactsView, the OrbitalCanvas file split,
CI pipeline, AlertDialog primitive.
