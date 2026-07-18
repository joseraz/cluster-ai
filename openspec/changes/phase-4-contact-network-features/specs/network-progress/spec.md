# Delta Spec: network-progress

## ADDED Requirements

### Requirement: Network progress indicator
WHEN the orbital visualization renders
THEN it SHALL show a minimal contact progress indicator near the top-left under the header area.

WHEN the user has contacts
THEN the indicator SHALL show current count, configured limit, progress bar value, and next milestone.

### Requirement: Create affordance at limit
WHEN the user has fewer contacts than the configured limit
THEN the orbital visualization SHALL show the "Create contact" affordance.

WHEN the user has reached the configured limit
THEN the orbital visualization SHALL hide the "Create contact" affordance.

### Requirement: Contact milestones
WHEN contact count is evaluated
THEN milestones SHALL be computed from a data-driven catalog containing thresholds 1, 3, 5, 12, 36, 60, 96, 120, and 150.

WHEN future achievements are added
THEN they SHALL be addable without changing the milestone-computation algorithm.
