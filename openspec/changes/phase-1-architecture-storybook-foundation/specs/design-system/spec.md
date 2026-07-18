## ADDED Requirements

### Requirement: Storybook UI Harness

Cluster AI SHALL provide a Storybook environment for reusable UI development and design-system review.

#### Scenario: Developer previews reusable UI

- **WHEN** a developer runs the Storybook dev script
- **THEN** Storybook SHALL load React/Vite stories using the app Tailwind theme and `@/` import alias
- **AND** stories SHALL render in dark mode by default.

#### Scenario: Developer validates documented UI

- **WHEN** a developer runs the Storybook build script
- **THEN** the documented stories SHALL compile without requiring the Hono API server, SQLite database, Auth0 session, or ElevenLabs session.

### Requirement: AI-Assisted UI Guidance

Cluster AI SHALL provide structured guidance for future AI-assisted development that encourages reuse of existing components and design tokens.

#### Scenario: Contributor starts a UI change

- **WHEN** a contributor or AI agent begins a UI change
- **THEN** they SHALL inspect the structured AI development guidance before adding new UI primitives
- **AND** they SHALL prefer existing registered components over duplicate components.

#### Scenario: Contributor adds reusable UI

- **WHEN** a contributor adds a reusable component
- **THEN** they SHALL add or update Storybook stories for that component
- **AND** they SHALL keep the component aligned with the quiet-luxury design-system guardrails.

