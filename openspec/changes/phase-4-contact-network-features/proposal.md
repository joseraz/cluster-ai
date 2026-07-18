# Phase 4 Contact Network Features

## Problem

Cluster AI's contact model still treats trusted relationship context as a single text field and allows unlimited network growth. That undermines the product promise: a premium, intentionally curated trust network where context is the product.

## Goals

- Enforce a hard, configurable maximum number of contacts per user.
- Hide create-contact affordances once the user reaches the contact limit.
- Show a minimal progress indicator on the orbital network surface.
- Add reusable contact-count milestones for light gamification.
- Replace the single "How did you meet?" storage model with editable relationship-story entries.
- Preserve existing create/edit flows while preparing the data model for future AI summarization.
- Cover the feature with API, database, UI, Storybook, and E2E tests.

## Non-Goals

- Build social feed, badges gallery, notifications, or reward redemption.
- Implement AI summarization in this phase.
- Build warm-introduction pathfinding.
- Remove all legacy `howWeMet` compatibility in one pass.

## Affected Capabilities

- `contact-management`: contact create limits, relationship story persistence, contact payload shape.
- `network-progress`: contact progress and milestone calculation/display.

## Impacted Files

- `server/db/schema.ts`
- `server/db/migrations/*`
- `server/routes/contacts.ts`
- `server/tests/*`
- `src/types/contact.ts`
- `src/api/contacts.ts`
- `src/contexts/ContactsContext.tsx`
- `src/components/contacts/*`
- `src/components/network/*`
- `src/pages/*`
- `src/lib/*`
- `src/stories/*`
- `e2e/*`
