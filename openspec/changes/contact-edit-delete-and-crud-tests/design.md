# Design: Contact Edit/Delete + CRUD Regression Tests

## Goals

- Complete the contact CRUD loop from the orbital canvas with the smallest credible diff
- Establish a repeatable, isolated regression suite (API + E2E) that future features rerun
- Respect the design system: quiet luxury, gold accent once or twice per surface,
  destructive styling reserved for delete

## Non-goals

- Edit from ContactsView (later iteration)
- OrbitalCanvas split (separate planned change — keep the canvas diff ~25 lines)
- CI pipeline (the CLAUDE.md rule is the enforcement mechanism for now)
- New AlertDialog primitive (reuse the existing `Dialog` confirm pattern)

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Sheet architecture | Dual-mode `ContactSheet` with optional `contact?: Contact \| null` prop (file renamed from `CreateContactSheet.tsx`) | ~90% of the component (fields, voice pipeline, validation) is identical in both modes; a separate edit component would duplicate the highest-maintenance code (voice/parse plumbing) |
| Delete confirm location | Sibling `Dialog` inside `ContactSheet` | Delete is only reachable in edit mode; keeps parents dumb, copies the proven reset-modal pattern in OrbitalCanvas |
| Edit click flow | `onEditContact?: (contact: Contact) => void` prop on OrbitalCanvas; NetworkView owns `editingContact` state | Mirrors the existing `onCreateContact` pattern; canvas stays presentation-only |
| Voice input in edit mode | Kept, unchanged | The voice "create" command routes to the shared save handler; transcript autofill may overwrite prefilled fields — accepted this iteration |
| DELETE hardening | 404 on unknown id; explicit `node_positions` cleanup | `node_positions.contactId` has no FK, so orphans must be deleted in the route |
| API test harness | Vitest 2.x + Hono `app.request()` | No HTTP server/port needed; Vitest 3 bundles Vite 6 which conflicts with the project's Vite 5.4 |
| Test DB isolation | `CLUSTER_DB_PATH` env read at module load in `server/db/client.ts`; `:memory:` for Vitest, `data/e2e.db` for Playwright | Tests must never touch `data/cluster.db` (real client data) |
| E2E stack | Playwright with two `webServer`s on dedicated ports (API 3201, Vite 8201) | Runs independently of (or alongside) the real dev server |
| E2E hover determinism | Pause spin (spin-level-0 button) before hovering; `data-contact-id` attributes on node groups | Nodes rotate by default; hovering a moving SVG target is flaky |

## Risks

- **Hover→click race** on the pencil: mitigated by the existing 40 ms leave-delay +
  overlay hover-bridge; the click handler clears hover refs so spin resumes correctly.
- **Module-load DB binding**: `CLUSTER_DB_PATH` must be set in `vitest.config.ts` `env`
  (before any import of `server/app.ts`), never inside test files.
- **WAL residue**: Playwright global setup deletes `e2e.db`, `e2e.db-wal`, `e2e.db-shm`.

## Rollout

Update path → manual verify (browser) → Delete path → manual verify → Vitest API suite
green → Playwright E2E suite green → CLAUDE.md rule making the suite a standing
requirement → final manual CRUD acceptance pass.
