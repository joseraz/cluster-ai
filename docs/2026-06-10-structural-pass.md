# Structural & Documentation Pass — Change Manifest

**Date:** 2026-06-10
**Plan:** Structural cleanup + CLAUDE.md rewrite. No feature code.
**Git state at start:** clean working tree except an uncommitted edit to `CLAUDE.md` (snapshotted below).

## Rollback quick reference

| Change type | How to undo |
|---|---|
| Deleted/edited tracked files | `git checkout -- <path>` |
| Uninstalled npm deps | `npm install @xyflow/react@^12.6.4 recharts@^2.12.7` |
| Moved DB files (gitignored — **git cannot restore**) | `mv data/cluster.db* ./` and revert path edits in `server/db/client.ts` + `drizzle.config.ts` |
| New files (`.env.example`, `src/types/contact.ts`, this manifest) | delete them |

## Snapshot: user's uncommitted CLAUDE.md edit (must survive the rewrite)

Added to the **Objective** section (after the existing paragraph):

> The platform needs to be designed and build in a scalable way so that the service generates enough value for users to cover its operational costs.

---

## Change log

### Step 0 — Manifest created
- **What:** Created `docs/2026-06-10-structural-pass.md` (this file).
- **Rollback:** delete this file.

### Step 1 — Shared types moved to `src/types/contact.ts`
- **What:**
  - Created `src/types/contact.ts` holding `ConnectionType`, `Contact`, `Cluster` (moved from `src/contexts/ContactsContext.tsx`) and `ContactFormData` (moved from `src/components/contacts/CreateContactSheet.tsx`).
  - Edited importers to use `@/types/contact`: `src/api/contacts.ts`, `src/api/clusters.ts`, `src/lib/seedData.ts`, `src/lib/serializeContacts.ts`, `src/lib/contactSearch.ts`, `src/lib/parseContactTranscript.ts`, `src/components/contacts/CreateContactSheet.tsx`, `src/contexts/ContactsContext.tsx`.
  - `useContacts` imports unchanged (8 files still import it from the context — correct).
- **Why:** Domain types shouldn't live in a provider/component; fixes lib→component inversion in `parseContactTranscript.ts`.
- **Verified:** `npx tsc --noEmit -p tsconfig.app.json` — only pre-existing errors in dead XY Flow files (deleted in Step 2); no errors in touched files.
- **Rollback:** `git checkout -- src/contexts/ContactsContext.tsx src/components/contacts/CreateContactSheet.tsx src/api/contacts.ts src/api/clusters.ts src/lib/seedData.ts src/lib/serializeContacts.ts src/lib/contactSearch.ts src/lib/parseContactTranscript.ts && rm src/types/contact.ts`

### Step 2 — Dead code deleted
- **What:** Deleted 10 files + 1 empty dir:
  - Dead XY Flow render path (replaced by OrbitalCanvas): `src/components/network/NetworkCanvas.tsx`, `UserNode.tsx`, `ContactNode.tsx`, `ZoomControls.tsx`
  - `src/lib/pathfinding.ts` (dead; coupled to XY Flow `Edge` type — rebuild against `relationships` table when warm-intro paths land)
  - Unused shadcn components (zero importers, grep-verified): `src/components/ui/accordion.tsx`, `checkbox.tsx`, `separator.tsx`, `skeleton.tsx`, `use-toast.ts` (unimported re-export of `src/hooks/use-toast.ts`)
  - Empty scaffold dir: `src/components/wizard/`
- **Why:** Nothing imports any of these; the XY Flow files didn't even typecheck.
- **CORRECTION (caught by typecheck):** `separator.tsx` and `skeleton.tsx` are imported *internally* by `src/components/ui/sidebar.tsx` (the original unused-check only looked outside `ui/`). Both restored via `git checkout`. Net deletions this step: 8 files + 1 dir. `accordion`/`checkbox`/`use-toast` re-verified safe including intra-ui imports.
- **Rollback:** `git checkout -- src/components/network/NetworkCanvas.tsx src/components/network/UserNode.tsx src/components/network/ContactNode.tsx src/components/network/ZoomControls.tsx src/lib/pathfinding.ts src/components/ui/accordion.tsx src/components/ui/checkbox.tsx src/components/ui/separator.tsx src/components/ui/skeleton.tsx src/components/ui/use-toast.ts && mkdir src/components/wizard`

### Step 3 — Unused dependencies removed
- **What:** `npm uninstall @xyflow/react recharts` (was `@xyflow/react@^12.6.4`, `recharts@^2.12.7`). Touches `package.json` + `package-lock.json`.
- **Why:** `@xyflow/react` only used by the dead files from Step 2; `recharts` had zero imports anywhere.
- **Rollback:** `npm install @xyflow/react@^12.6.4 recharts@^2.12.7` (or `git checkout -- package.json package-lock.json && npm install`).

### Step 4 — SQLite DB moved to `data/`
- **What:**
  - Moved `cluster.db`, `cluster.db-shm`, `cluster.db-wal` from repo root → `data/` (files moved intact, never rewritten).
  - `server/db/client.ts`: db path now `data/cluster.db`; added `mkdirSync(dataDir, { recursive: true })` so fresh clones don't crash.
  - `drizzle.config.ts`: `url: './data/cluster.db'`.
  - `.gitignore`: replaced three `cluster.db*` entries with `data/` (verified via `git check-ignore`).
- **Why:** Declutters repo root; groups gitignored DB artifacts.
- **Rollback (git cannot restore the DB files — they are gitignored):** `mv data/cluster.db* ./ && rmdir data && git checkout -- server/db/client.ts drizzle.config.ts .gitignore`

### Step 5 — `.env.example` added
- **What:** Created `.env.example` documenting `VITE_ELEVENLABS_API_KEY` (the only env var, lives in gitignored `.env.local`).
- **Rollback:** `rm .env.example`

### Step 6 — CLAUDE.md rewritten
- **What:** Full rewrite. Preserved verbatim: Objective (including the user's uncommitted scalability sentence — snapshotted at top of this manifest), Product Vision, OpenSpec Framework, Design System primitives/typography/radius. Corrected/added:
  - Commands: full script table incl. `dev` (concurrently), `db:generate`, `db:studio`, `/api` proxy note
  - Tech Stack: Hono + better-sqlite3 + Drizzle backend; custom SVG OrbitalCanvas (XY Flow removed); ElevenLabs voice; React Query as the data layer
  - Removed stale claims: "no backend / localStorage cluster-contacts", "4-step wizard", "XY Flow v12", "white edges"
  - New sections: Data Flow, Directory Map, Backend (5-table schema, denormalization note), Voice & Mr. Fox, Known Debt (6 items incl. deferred OrbitalCanvas split)
- **Rollback:** `git checkout -- CLAUDE.md` restores the committed version (note: this loses the user's uncommitted Objective sentence — re-add it from the snapshot at the top of this file).

### Step 7 — Static verification ✅
- `npx tsc --noEmit -p tsconfig.app.json` → clean (after Step 2 correction)
- `npm run lint` → 0 errors, 7 pre-existing react-refresh warnings
- `npm run build` → ✓ built in 2.34s
- `grep -rn "xyflow|NetworkCanvas|ZoomControls|pathfinding" src/ server/` → no matches
- `git status` → `data/` not tracked; only intended changes present

### Step 8 — Runtime + browser verification ✅
- **Stale process note:** a dev session from before this pass was still holding ports 8080/3001 (old API server had pre-move state and returned `[]`). Killed PIDs 4794 + 82677 and started a clean `npm run dev`. **No data was lost** — `sqlite3 data/cluster.db "SELECT count(*) FROM contacts"` → 17 throughout.
- `GET /api/health` (direct :3001 and via :8080 proxy) → `{"status":"ok","db":"sqlite"}`
- `GET /api/contacts` via proxy → all 17 contacts from `data/cluster.db`
- Chrome (Claude extension): landing page renders; `/app/network` shows OrbitalCanvas with all 17 contacts on rings, gold edges, sidebar count 17; Create Contact sheet opens with all fields (proves type move works at runtime) and closes cleanly.
- Console: **one pre-existing error**, unrelated to this pass — Radix a11y warning: `DialogContent requires a DialogTitle` (worth fixing someday; not introduced here).

## Result: PASS — all changes verified end-to-end. 2026-06-10.
