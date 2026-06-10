# Delta Spec: contact-management

## ADDED Requirements

### Requirement: Edit a contact from the orbital canvas
WHEN the user hovers a contact node on the orbital canvas
THEN the hover card SHALL display an edit (pencil) affordance in its top-right corner.

WHEN the user clicks the edit affordance
THEN the contact sheet SHALL open in edit mode, titled "Update Contact", with every
field prefilled from the selected contact.

WHEN the user changes details and presses "Save"
THEN the changes SHALL be persisted via `PATCH /api/contacts/:id`, required-field
validation (firstName, lastName, connectionType, howWeMet) SHALL still apply, and the
canvas and contact list SHALL reflect the updated data without a page reload.

### Requirement: Delete a contact with destructive confirmation
WHEN the contact sheet is in edit mode
THEN its footer SHALL show a destructive "Delete" button in place of "Cancel".

WHEN the user presses "Delete"
THEN a destructive confirmation modal SHALL warn that the contact's data will be
permanently lost, offering Cancel and a destructive confirm action.

WHEN the user confirms deletion
THEN the contact SHALL be removed via `DELETE /api/contacts/:id`, the sheet and modal
SHALL close, and the node SHALL no longer render on the canvas (including after reload).

### Requirement: Delete hygiene on the server
WHEN `DELETE /api/contacts/:id` is called with an unknown id
THEN the API SHALL respond 404.

WHEN a contact is deleted
THEN its `node_positions` row (if any) SHALL also be deleted.

### Requirement: Create validation
WHEN `POST /api/contacts` is called without firstName or lastName
THEN the API SHALL respond 400 (not a 500 from a database constraint).
