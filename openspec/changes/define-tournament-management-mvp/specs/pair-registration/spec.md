## ADDED Requirements

### Requirement: Organizer can register pairs
The system SHALL allow the organizer to register a tournament entry as exactly two players forming one pair.

#### Scenario: Register pair
- **WHEN** the organizer enters two valid player names for a tournament category
- **THEN** the system creates one pair entry in that category

### Requirement: Pair entries have registration states
The system SHALL track each pair entry as pending, confirmed, waitlisted, withdrawn, or disqualified.

#### Scenario: Confirm pair
- **WHEN** the organizer confirms a pending pair
- **THEN** the system marks that pair as confirmed

### Requirement: Capacity applies to confirmed pairs
The system SHALL enforce category capacity against confirmed pairs and keep extra entries waitlisted.

#### Scenario: Capacity reached
- **WHEN** the organizer confirms a pair after the category capacity is full
- **THEN** the system prevents confirmation or places the pair on the waitlist

### Requirement: Pair data can be edited
The system SHALL allow the organizer to edit player and pair details before the pair is used in a completed match.

#### Scenario: Edit player name
- **WHEN** the organizer changes a player name for an eligible pair
- **THEN** the system updates the pair display name across tournament views
