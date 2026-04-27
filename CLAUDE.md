# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (port 8080)
npm run build     # Production build
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

No test suite is configured.

## Tech Stack

- **React 18 + TypeScript** with Vite (SWC)
- **UI**: shadcn/ui (Radix UI primitives) + Tailwind CSS with HSL CSS variable theming
- **State**: React Context (`ContactsContext`, `ThemeContext`) — no external store
- **Routing**: React Router DOM v6 (nested routes under `/app/*`)
- **Data fetching**: TanStack React Query v5 (configured, not heavily used yet)
- **Graph**: XY Flow v12 for the network visualization canvas
- **Forms**: React Hook Form + Zod
- **Auth**: Auth0 React (wired up in Login page, not yet gating routes)

## Architecture

Cluster AI is a visual network/relationship management app. The core feature is an interactive node-graph showing a user at center connected to their contacts arranged in a circle.

### Routing

```
/            → Index.tsx (landing page)
/login       → Login.tsx (Auth0 entry point)
/app/*       → Layout with AppSidebar
  /app/network   → NetworkView.tsx
  /app/contacts  → ContactsView.tsx
```

### State & Data

All contact data lives in `ContactsContext` (`src/contexts/ContactsContext.tsx`), persisted to `localStorage` under the key `cluster-contacts`. Seed data (24 sample contacts) is loaded on first run. Components access contacts via `useContacts()`.

There is no backend — everything is client-side localStorage.

### Network Canvas

`NetworkCanvas.tsx` is the core visualization component. It converts contacts from context into XY Flow nodes/edges:
- `UserNode` — center node, repositioned dynamically on viewport resize
- `ContactNode` — contacts placed in a circle using polar coordinates (radius 290px)
- Edges are thin white lines connecting user to each contact

### Contact Creation

`CreateContactSheet.tsx` is a 4-step wizard sheet:
1. Basic info (firstName, lastName required)
2. Social media links (optional)
3. Interests/about (optional)
4. Connection details (type, strength 1–10, how met — required)

### Path Aliases

`@/` maps to `src/` — use this for all internal imports.

### Theming

Dark mode is the default. The theme is toggled via `ThemeContext` and persisted to localStorage. Colors are defined as HSL CSS variables in `src/index.css`; use the Tailwind CSS variable references (`bg-background`, `text-foreground`, etc.) rather than raw hex values.

## Open Spec Framework

This project uses [Open Spec](https://openspec.dev/) — a spec-driven framework that keeps requirements as markdown files in the repo for persistent AI context across sessions.

**Directory layout:**
```
openspec/specs/[feature-name]/spec.md   # living feature specs
openspec/changes/[change-id]/           # per-change proposals, design, tasks
```

**Workflow:** Before implementing a new feature or significant change, generate a proposal:
```bash
npm install -g @fission-ai/openspec@latest   # one-time global install
/openspec:proposal <description of change>
```

Review the generated `proposal.md`, `design.md`, and `tasks.md` before writing any code.
