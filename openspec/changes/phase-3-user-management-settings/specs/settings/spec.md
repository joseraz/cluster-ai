# Delta Spec: settings

## ADDED Requirements

### Requirement: Profile settings
Authenticated users SHALL be able to configure first name, last name, and location.

WHEN an authenticated user opens Settings
THEN the app SHALL show their current profile settings.

WHEN an authenticated user submits a valid first name, last name, and location update
THEN the API SHALL persist the update for the effective user and return the updated profile.

WHEN first name or last name is empty or too long
THEN the API SHALL reject the update with 400.

### Requirement: Extensible settings page
The Settings page SHALL be structured so future settings sections can be added without rewriting the page.

WHEN a new settings section is added
THEN it SHALL be representable as a page section component with its own title, description, and content.
