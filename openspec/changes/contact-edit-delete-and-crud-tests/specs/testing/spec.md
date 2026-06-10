# Delta Spec: testing

## ADDED Requirements

### Requirement: Contact CRUD regression suite
The repository SHALL contain an automated regression suite covering the full contact
CRUD lifecycle at two levels:

- **API**: create → read (list + detail) → update → delete → 404, plus create
  validation and `node_positions` cleanup on delete, run with `npm run test`
  (Vitest, in-memory SQLite, Hono `app.request()`).
- **End-to-end**: create via the contact sheet, node rendering, hover → edit → save,
  and delete via the destructive confirmation, run with `npm run test:e2e`
  (Playwright, isolated DB and ports).

WHEN any feature work is marked complete
THEN `npm run test` SHALL pass; and for changes touching the orbital canvas, the
contact sheet, or contact API routes, `npm run test:e2e` SHALL pass as well.

WHEN the suite runs
THEN it SHALL NOT read or write `data/cluster.db` (real client data); isolation is via
the `CLUSTER_DB_PATH` environment variable.
