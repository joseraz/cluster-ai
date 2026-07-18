# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Objective

We're building an app that helps high networth individual to visualize their network of trusted contacts. This is a premium luxury service where we charge a high markup for the reliability, security, and privacy of our client's data.

The platform needs to be designed and build in a scalable way so that the service generates enough value for users to cover its operational costs.

## Product Vision

**Full reference:** `openspec/specs/product-vision/spec.md`

Cluster AI solves a **trust routing problem**, not a discovery problem. Users don't need more connections — they need the right introduction, through a credible relationship path, with context on how to approach the person. The system should feel like a best friend making a thoughtful introduction.

**Core principles every feature must respect:**
- Reduce cognitive load — surface a small, curated set; never a wall of options
- Protect social capital — never encourage cold outreach at scale
- Context is the product — not just who, but how to approach them
- Trust is earned incrementally — accuracy and respect before autonomy

## Commands

```bash
npm run dev        # Vite (port 8080) + Hono API (port 3001) concurrently
npm run dev:ui     # Frontend only
npm run dev:api    # Backend only (tsx watch server/index.ts)
npm run build      # Production build (frontend)
npm run lint       # Run ESLint
npm run preview    # Preview production build
npm run db:generate  # Generate Drizzle migration from schema changes
npm run db:studio    # Drizzle Studio (browse the SQLite DB)
npm run test         # Vitest API regression suite (server/tests/, in-memory DB)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright E2E CRUD suite (e2e/, isolated ports + data/e2e.db)
npm run test:all     # Both suites
```

The Vite dev server proxies `/api/*` to `http://localhost:3001` (see `vite.config.ts`), so the frontend always fetches relative `/api` paths.

## Testing (mandatory)

Contact CRUD is the bread and butter of the platform. **Before marking any feature
complete, run `npm run test`. For changes touching the orbital canvas, the contact
sheet, or contact API routes, also run `npm run test:e2e`.** Both suites must pass.

- Tests never touch `data/cluster.db` (real client data): the DB path is overridden via
  the `CLUSTER_DB_PATH` env var (`:memory:` for Vitest, `data/e2e.db` for Playwright)
- API tests call the exported Hono app directly (`server/app.ts` → `app.request()`)
- E2E runs its own servers on ports 3201/8201, so it works alongside `npm run dev`

## Tech Stack

- **React 18 + TypeScript** with Vite (SWC)
- **Backend**: Hono + better-sqlite3 + Drizzle ORM (`server/`), SQLite file at `data/cluster.db` (gitignored — real contact data, never commit)
- **UI**: shadcn/ui (Radix UI primitives) + Tailwind CSS with HSL CSS variable theming
- **State**: React Context (`ContactsContext`, `SearchContext`, `ThemeContext`) over **TanStack React Query v5** — all contact data flows through React Query; no external store
- **Routing**: React Router DOM v6 (nested routes under `/app/*`)
- **Graph**: custom SVG `OrbitalCanvas` (XY Flow was removed — do not reintroduce it)
- **Voice**: ElevenLabs — `@elevenlabs/react` conversational agent ("Mr. Fox") + Scribe realtime transcription. Requires `VITE_ELEVENLABS_API_KEY` in `.env.local`
- **Forms**: React Hook Form + Zod
- **Auth**: Auth0 React (login buttons are stubs; routes are NOT gated yet)

## Architecture

Cluster AI is a visual network/relationship management app: an orbital node-graph with the user at center and contacts arranged on concentric rings, backed by a local API.

### Data Flow

```
component → useContacts() (ContactsContext, React Query)
          → src/api/*.ts (fetch wrappers for /api/*)
          → server/routes/*.ts (Hono routers)
          → Drizzle ORM → SQLite (data/cluster.db)
```

### Directory Map

```
server/               Hono backend (port 3001, override via API_PORT)
  app.ts              App construction: CORS, routers, /api/health, runs migrations on import
  index.ts            Entry point: serve(app) only
  db/                 schema.ts (5 tables), client.ts (DB path via CLUSTER_DB_PATH), migrate.ts, migrations/
  routes/             contacts.ts, clusters.ts, nodePositions.ts
  tests/              contacts.api.test.ts — Vitest CRUD regression suite
e2e/                  Playwright CRUD regression suite (contact-crud.spec.ts)
src/
  api/                Thin fetch wrappers: contacts, clusters, nodePositions
  types/              contact.ts — shared domain types (Contact, Cluster, ConnectionType, ContactFormData)
  contexts/           ContactsContext (React Query CRUD), SearchContext, ThemeContext
  components/
    network/          OrbitalCanvas, VoiceSearchBar, SearchResultCard, FiltersPanel
    contacts/         ContactSheet (voice-driven create/edit), AddContactDialog (manual)
    mrfox/            MrFoxButton, MrFoxModal — ElevenLabs agent UI
    layout/           AppSidebar
    ui/               shadcn/ui primitives
  hooks/              useMrFox, useNodePositions, useRealtimeVoiceRecorder, useVoiceRecorder
  lib/                contactSearch, parseContactTranscript, serializeContacts, elevenlabs, seedData
  pages/              Index (landing), Login, NetworkView, ContactsView, NotFound
openspec/             Specs + change proposals (see Open Spec Framework below)
docs/                 supabase-migration.md, change manifests
data/                 SQLite files (gitignored)
```

### Routing

```
/            → Index.tsx (landing page)
/login       → Login.tsx (Auth0 stubs — buttons currently redirect straight to /app/network)
/app/*       → Layout with AppSidebar, wrapped in SearchProvider
  /app/network   → NetworkView.tsx (OrbitalCanvas)
  /app/contacts  → ContactsView.tsx
```

### State & Data

- **`ContactsContext`** (`src/contexts/ContactsContext.tsx`) — fetches contacts via React Query from `/api/contacts`; mutations invalidate the cache. `loadSeedData()` bulk-inserts 23 sample contacts (dev only). **There is no localStorage persistence for contacts anymore.**
- **`SearchContext`** — search query/results state shared by NetworkView (result animation) and ContactsView (list filtering). Search itself is client-side (`src/lib/contactSearch.ts` — tokenized, synonym-aware relevance scoring).
- **`ThemeContext`** — dark/light toggle; the only remaining localStorage use.
- **Shared types** live in `src/types/contact.ts` — import domain shapes from there, never from a context or component.

### Backend

`server/app.ts` runs migrations on import, mounts three routers, exposes `/api/health`, and exports the Hono `app` (tests call it via `app.request()`); `server/index.ts` just serves it. Schema (`server/db/schema.ts`) has 5 tables:

- `contacts` — core node data. `connectionType` / `connectionStrength` / `howWeMet` are **intentionally denormalized** here for Phase 1 (avoids a JOIN per fetch)
- `relationships` — edge table (defined, **not yet used by any route** — reserved for warm-intro pathfinding)
- `clusters` + `cluster_members` — grouping (DB-complete; not exposed in UI — deferred from MVP)
- `node_positions` — UI-only state: drag-pinned ring/angle per contact for the orbital canvas

Migration path to Supabase is documented in `docs/supabase-migration.md`.

### Network Canvas

`OrbitalCanvas.tsx` (`src/components/network/`) is the core visualization: pure SVG, five concentric rings (radii 95–325px), nodes default to the outermost ring. Dragging snaps a node to the nearest ring and persists ring+angle via `/api/node-positions`. Also handles spin animation, search-result grid animation, and hover info cards.

⚠️ **Known debt:** this file is ~1,100 lines mixing five concerns (rendering, animation math, drag, search grid, tooltips). A split is planned — run it through `/opsx:propose` before significant canvas work.

### Contact Create / Edit / Delete

`ContactSheet.tsx` is a **single scrollable sheet** (not a wizard) with realtime voice input: speech → `useRealtimeVoiceRecorder` → `parseContactTranscript.ts` (regex field extraction) → form auto-fill with missing-field prompts. Required: firstName, lastName, connectionType, howWeMet. `AddContactDialog.tsx` is the manual alternative.

The sheet is dual-mode: pass `contact` to open it in edit mode ("Update Contact", prefilled, Save + destructive Delete with a confirmation modal). Editing is reached via the pencil icon on the canvas node hover card (`onEditContact` prop on `OrbitalCanvas`). Deleting a contact also removes its `node_positions` row server-side.

### Voice & Mr. Fox

- **Mr. Fox** (`src/hooks/useMrFox.ts`, `src/components/mrfox/`) — ElevenLabs conversational agent. The full contact list is serialized (`src/lib/serializeContacts.ts`) and injected as agent context. Agent ID is currently hardcoded in `useMrFox.ts`.
- **Voice search removed** — `SearchBar.tsx` is now a plain text input (no mic). `useRealtimeVoiceRecorder.ts` is still used by ContactSheet for voice-driven contact creation.
- Env: set `VITE_ELEVENLABS_API_KEY` in `.env.local`.

### Path Aliases

`@/` maps to `src/` — use this for all internal imports.

### Theming

Dark mode is the default. The theme is toggled via `ThemeContext` and persisted to localStorage. Colors are defined as HSL CSS variables in `src/index.css`; use the Tailwind CSS variable references (`bg-background`, `text-foreground`, etc.) rather than raw hex values.

## Known Debt (do not "fix" casually — propose via OpenSpec)

1. **OrbitalCanvas split** — top priority refactor; see Network Canvas section
2. **Auth0 route gating** — login is stubbed, `/app/*` is open
3. **`relationships` table unused** — warm-intro pathfinding (core product feature) not yet built
4. **Hardcoded Mr. Fox agent ID** in `useMrFox.ts` — should move to env
5. **Unit-test gaps** — contact CRUD is covered (API + E2E regression suites; see Testing), but `contactSearch.ts` and `parseContactTranscript.ts` still have no unit tests

## Open Spec Framework

This project uses [Open Spec](https://openspec.dev/) — a spec-driven framework that keeps requirements as markdown files in the repo for persistent AI context across sessions.

**Trigger rule:** Run the OpenSpec workflow before implementing any new feature or significant change. Do not write code first.

**One-time setup:**
```bash
npm install -g @fission-ai/openspec@latest
```

**Directory layout:**
```
openspec/
  config.yaml                          # Project context injected into AI tools
  specs/[capability-name]/spec.md      # Source-of-truth WHEN/THEN behavioral specs
  changes/[change-name]/
    .openspec.yaml
    proposal.md                        # Problem statement, affected capabilities, impacted files
    design.md                          # Technical decisions, goals/non-goals, risks, rollout
    tasks.md                           # Hierarchical implementation checklist
    specs/                             # Delta specs (ADDED/MODIFIED/REMOVED sections only)
  changes/archive/                     # Completed changes with merged history
  schemas/                             # Custom workflow templates (optional)
```

**Workflow:**
```
/opsx:propose [change-name]   # Generate proposal.md, design.md, tasks.md, delta specs
/opsx:apply                   # Implement by progressing through tasks.md checklist
/opsx:verify                  # Validate implementation against specs and design
/opsx:archive                 # Merge delta specs into specs/, move change to archive/
```

Review `proposal.md` and `design.md` before running `/opsx:apply`. Never skip straight to code.

## Component Registry

Quick reference for targeted edits — use `@path` in prompts to include a file directly.

**Maintenance rule:** Whenever you create a new component, page, context, hook, or lib utility, add a row to this table before marking the task complete.

| Component | Path | Responsibility |
|---|---|---|
| `OrbitalCanvas` | `src/components/network/OrbitalCanvas.tsx` | SVG graph, concentric rings, drag, animation, tooltips |
| `ContactSheet` | `src/components/contacts/ContactSheet.tsx` | Create/edit slide-over (voice + form, dual-mode) |
| `AddContactDialog` | `src/components/contacts/AddContactDialog.tsx` | Manual create modal |
| `MrFoxButton` | `src/components/mrfox/MrFoxButton.tsx` | ElevenLabs agent trigger button |
| `MrFoxModal` | `src/components/mrfox/MrFoxModal.tsx` | ElevenLabs conversational agent UI |
| `SearchBar` | `src/components/network/SearchBar.tsx` | Text search input with clear/submit |
| `SearchResultCard` | `src/components/network/SearchResultCard.tsx` | Search result display card |
| `FiltersPanel` | `src/components/network/FiltersPanel.tsx` | Contact filter controls |
| `AppSidebar` | `src/components/layout/AppSidebar.tsx` | Navigation sidebar |
| `NetworkView` | `src/pages/NetworkView.tsx` | Canvas page — mounts OrbitalCanvas |
| `ContactsView` | `src/pages/ContactsView.tsx` | List page — filtered contact table |
| `ContactsContext` | `src/contexts/ContactsContext.tsx` | React Query CRUD + cache invalidation |
| `contactSearch` | `src/lib/contactSearch.ts` | Client-side tokenized search scoring |
| `parseContactTranscript` | `src/lib/parseContactTranscript.ts` | Voice → form field regex extraction |
| `serializeContacts` | `src/lib/serializeContacts.ts` | Contacts → Mr. Fox agent context string |

## Design System

Full reference: `openspec/specs/design-system/spec.md`

**Quiet luxury. Candlelit dark mode. Gold accent on warm blacks. No blue, no indigo, no cool gray.**

**Colour primitives (hex → HSL):**
- obsidian `#1A1816` → `30 9% 9%` — page background (dark)
- walnut `#241F1C` → `24 13% 12%` — card surface (dark)
- walnut-light `#2E2823` → `28 13% 16%` — secondary / muted / border (dark)
- espresso `#3B2E25` → `26 23% 19%` — accent background (dark)
- ivory `#FAF6F0` → `36 50% 96%` — page background (light)
- cream `#F4EDE4` → `34 42% 93%` — body text (dark)
- sand `#C7B8A3` → `35 24% 71%` — muted foreground (dark)
- gold `#C9A96E` → `39 46% 61%` — primary / CTA in both modes

**Typography:** `font-display` = Playfair Display (headlines), `font-body` = Inter (UI/body)

**Radius:** `--radius: 1rem` → `rounded-lg` = 16px (cards), `rounded-full` for pills/avatars

**Rules:**
- Never use raw hex in component files — always use CSS variables via Tailwind (`bg-primary`, `text-muted-foreground`, etc.)
- `OrbitalCanvas` renders SVG with inline styles; update it with hex values from the design system spec (e.g., edges are gold at low opacity `rgba(201,169,110,0.22)`, never white/blue)
- Gold appears once or twice per surface, never more
