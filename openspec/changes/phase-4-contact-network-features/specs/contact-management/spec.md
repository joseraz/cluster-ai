# Delta Spec: contact-management

## ADDED Requirements

### Requirement: Contact limit
WHEN a user has fewer than the configured contact limit
THEN `POST /api/contacts` SHALL create a contact normally.

WHEN a user already has the configured contact limit
THEN `POST /api/contacts` SHALL respond `409` and SHALL NOT insert another contact.

WHEN one user has reached the configured contact limit
THEN another user below the limit SHALL still be able to create contacts.

### Requirement: Relationship stories
WHEN a contact is created with relationship stories
THEN each non-empty story SHALL be persisted with its own id, body, created timestamp, and updated timestamp.

WHEN a contact is fetched from list or detail endpoints
THEN the response SHALL include `relationshipStories` ordered oldest first.

WHEN a contact is updated with relationship stories
THEN the saved story collection SHALL reflect edited existing entries and new entries.

WHEN a contact is deleted
THEN its relationship stories SHALL also be deleted.

### Requirement: Legacy relationship context compatibility
WHEN a create or update request supplies `howWeMet` but no explicit `relationshipStories`
THEN the API SHALL preserve that text as a relationship story.

WHEN a contact has relationship stories
THEN the response's legacy `howWeMet` field SHALL be derived from the earliest story body.

### Requirement: Connection strength controls orbital distance
WHEN a contact's `connectionStrength` is updated
THEN the orbital visualization SHALL render that contact on the corresponding strength ring.

WHEN a contact has a saved custom angle
THEN updating `connectionStrength` SHALL preserve the angle and remove the saved ring override.

WHEN a user drags a contact node to a different orbital ring
THEN the contact's `connectionStrength` SHALL update to match that ring, where the innermost ring is strength 5 and the outermost ring is strength 1.

### Requirement: Contact voice input feature flag
WHEN a user disables contact voice input in Settings
THEN contact create and update sheets SHALL hide the voice input control.

WHEN a user enables contact voice input in Settings
THEN contact create and update sheets SHALL show the voice input control.

### Requirement: Mr Fox feature flag
WHEN a user disables the Mr Fox feature in Settings
THEN the persistent "Talk to Mr. Fox" header button SHALL be hidden.

WHEN a user enables the Mr Fox feature in Settings
THEN the persistent "Talk to Mr. Fox" header button SHALL be shown.
