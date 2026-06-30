## ADDED Requirements

### Requirement: Organizer can create tournaments
The system SHALL allow the organizer to create a tournament with a name, venue, date range, categories, registration capacity, and initial status.

#### Scenario: Create draft tournament
- **WHEN** the organizer submits valid tournament details
- **THEN** the system creates a draft tournament available in the organizer workspace

### Requirement: Organizer can edit tournament details
The system SHALL allow the organizer to edit tournament details before and during operation while preserving existing participants and matches.

#### Scenario: Update tournament venue
- **WHEN** the organizer changes the venue of an existing tournament
- **THEN** the system stores the updated venue without removing tournament entries or matches

### Requirement: Tournament has operational statuses
The system SHALL track tournament status as draft, registration-open, registration-closed, in-progress, completed, or cancelled.

#### Scenario: Close registration
- **WHEN** the organizer closes registration for a registration-open tournament
- **THEN** the system marks the tournament as registration-closed

### Requirement: MVP is scoped to one club
The system SHALL manage tournaments for a single club or organizer without tenant switching.

#### Scenario: Organizer views tournaments
- **WHEN** the organizer opens the tournament list
- **THEN** the system shows tournaments for the single configured club or organizer
