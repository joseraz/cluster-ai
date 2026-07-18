# Design

## Current Architecture Assessment

See `docs/architecture-assessment.md` for the phase assessment. The assessment is intentionally short and decision-oriented so it can guide Phase 2 planning without becoming a second source of truth for implementation details already covered by specs and `AGENTS.md`.

## Storybook

Storybook will be added through the Vite React framework integration so it shares the app's build assumptions: React 18, Vite, Tailwind CSS, and the `@/` alias. Global Storybook preview imports `src/index.css` and wraps stories in the dark-mode class because dark mode is the primary design target.

Initial stories focus on reusable and low-risk components:

- `Button`: validates shadcn variant and size API.
- `SearchBar`: validates the network search control without backend dependencies.
- `SearchResultCard`: validates highlighted contact-result presentation.
- `FiltersPanel`: validates filter UI within the existing `ContactsContext` default shape.
- Design-system foundation stories: token swatches and AI contributor guidance.

Components that require live API state, ElevenLabs runtime state, or the 1,100-line orbital canvas are deferred until those dependencies have explicit mock boundaries.

## AI Development Guidance

Create `src/config/aiDevelopmentGuidance.ts` as a structured, testable source for future contributors and AI-assisted development. It does not replace `AGENTS.md` or the OpenSpec specs. Instead, it provides an importable summary for Storybook, tests, and future tooling:

- mandatory workflow checkpoints
- reusable component registry
- design-system guardrails
- prohibited duplication patterns
- recommended validation commands

The companion documentation in `docs/ai-development-guidance.md` explains how humans and AI agents should use it before creating UI.

## Testing Strategy

- Add Vitest coverage for the guidance module so key rules do not silently disappear.
- Expand `vitest.config.ts` to include source-level tests in addition to API tests.
- Run `npm run test`.
- Run `npm run build-storybook`.
- Run `npm run build`.

## Risks

- Storybook package installation updates the lockfile and may expose dependency-version friction.
- Some existing components use inline raw colors because the current canvas/search-card implementation predates stricter enforcement. This phase documents and harnesses the system; it does not perform broad visual refactors.

