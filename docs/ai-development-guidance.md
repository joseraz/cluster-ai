# AI Development Guidance

Cluster AI uses `src/config/aiDevelopmentGuidance.ts` as the structured source for future AI-assisted UI work. This file complements `AGENTS.md` and the OpenSpec specs; it does not replace them.

## How To Use It

1. Read the relevant OpenSpec proposal or create one before a new feature or significant change.
2. Inspect `aiDevelopmentGuidance` before creating UI.
3. Reuse registered components first, especially shadcn/Radix primitives and existing product components.
4. Add or update Storybook stories for reusable UI.
5. Validate with tests and Storybook build before marking the change complete.

## Rules For Future Contributors

- Use `@/components/ui/*` primitives before introducing new UI primitives.
- Use Tailwind classes backed by CSS variables; avoid raw hex values in component files unless the design-system spec explicitly allows inline canvas styling.
- Keep gold rare and intentional.
- Keep dark mode as the primary review target.
- Do not introduce duplicate search, filter, dialog, sheet, sidebar, button, badge, input, select, or tooltip components.
- Prefer mockable component boundaries over full app providers in Storybook.

## Storybook Expectations

Storybook is now the primary harness for reusable UI development. A reusable component is not considered documented unless it has a story or is intentionally excluded because it depends on live API, browser permissions, authentication, voice runtime, or the current unsplit orbital canvas.

