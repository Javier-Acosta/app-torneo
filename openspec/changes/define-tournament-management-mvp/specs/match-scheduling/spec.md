## ADDED Requirements

### Requirement: Organizer can create group matches
The system SHALL allow the organizer to create group-stage matches between pairs assigned to the same group and category.

#### Scenario: Create group match
- **WHEN** the organizer selects two pairs from the same group
- **THEN** the system creates a pending group match for those pairs

### Requirement: Organizer can schedule matches
The system SHALL allow the organizer to assign date, start time, court, and display order to a match.

#### Scenario: Assign court and time
- **WHEN** the organizer schedules a pending match on Court 1 at a valid time
- **THEN** the system stores the court and time for that match

### Requirement: Matches have lifecycle states
The system SHALL track match state as pending, scheduled, in-progress, completed, walkover, cancelled, or postponed.

#### Scenario: Postpone match
- **WHEN** the organizer postpones a scheduled match
- **THEN** the system marks the match as postponed and keeps its participants unchanged

### Requirement: Organizer can edit unfinished matches
The system SHALL allow match schedule and participant corrections while the match is not completed or marked as walkover.

#### Scenario: Reschedule pending match
- **WHEN** the organizer changes the time of a pending match
- **THEN** the system updates the match schedule
