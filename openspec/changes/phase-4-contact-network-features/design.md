# Design

## Contact Limit

The server is authoritative. `CONTACT_LIMIT` config resolves from `CONTACT_LIMIT` and defaults to `150`. `POST /api/contacts` counts contacts for the effective user before insert and returns `409` when the limit is reached. Counting is tenant-scoped.

The frontend uses the same default via `VITE_CONTACT_LIMIT`, falling back to `150`. The create button is hidden once `contacts.length >= CONTACT_LIMIT`. This is a convenience display only; server enforcement remains the source of truth.

## Connection Strength And Orbit Distance

Connection strength maps directly to the five orbital rings: strength `5` renders closest to the user node and strength `1` renders on the outer ring. Updating the slider in the contact sheet updates the contact strength and clears any saved ring override for that contact, preserving custom angle but allowing the new strength to control orbital distance.

Dragging a node to a ring is the inverse operation: the dropped ring updates `connectionStrength` using the same mapping. Node positions persist only angle; ring distance is derived from `connectionStrength` so slider and canvas cannot drift apart.

## Contact Voice Input Feature Flag

Add `contact_voice_input_enabled` to `user_profiles`, defaulting to enabled for existing behavior. `/api/me` returns it with the profile and `/api/me/profile` accepts boolean updates. The Settings page includes a Features section with a "Contact voice input" switch. Contact create/edit sheets hide the voice-input control when disabled.

Add `mr_fox_enabled` to `user_profiles`, also defaulting to enabled. The Settings Features section includes a "Talk to Mr. Fox" switch that controls whether the persistent header button is rendered.

## Progress Indicator

Add a small network progress component in the orbital visualization's top-left area. It displays count, limit, a slim progress bar, and the next milestone. It avoids loud badges or reward language so the experience remains premium.

## Milestones

Create a data-driven milestone catalog:

- First contact: threshold `1`
- 3 contacts
- 5 contacts
- 12 contacts
- 36 contacts
- 60 contacts
- 96 contacts
- 120 contacts
- 150 contacts

A utility computes achieved milestones and the next milestone from a contact count. Future achievements can be added by appending catalog entries with id, label, threshold, and category.

## Relationship Stories

Add `relationship_stories` as a first-class child table:

- `id`
- `user_id`
- `contact_id`
- `body`
- `summary`
- `summary_status`
- `occurred_at`
- `created_at`
- `updated_at`

Rows belong to one user's contact and cascade when the contact is deleted. `summary` and `summary_status` are nullable scaffolding for future AI summarization.

The contact API returns `relationshipStories` on list and detail responses. Create and patch accept `relationshipStories` arrays. For backward compatibility, incoming `howWeMet` creates or updates a single initial story when no explicit story array is supplied, and outgoing `howWeMet` is derived from the earliest story when present.

The contact sheet renames the UI prompt to "Relationship stories", supports multiple editable entries, and requires at least one non-empty story on create/update.

## Testing Strategy

- API tests for contact-limit enforcement, tenant isolation, contact payload stories, story edit behavior, and delete cascade.
- Database tests for relationship-story cascade and summary-ready columns.
- Unit tests for milestone computation and progress UI rendering.
- API/UI tests for connection-strength orbital distance updates, profile feature flag persistence, and gated voice input.
- Storybook stories for progress and story-entry states.
- E2E tests for hiding create at the limit and creating/editing story entries.
