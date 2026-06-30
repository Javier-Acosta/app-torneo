## ADDED Requirements

### Requirement: System calculates group standings
The system SHALL calculate standings for each group using completed group match results.

#### Scenario: Completed match changes table
- **WHEN** a completed group match is saved
- **THEN** the system updates matches played, wins, losses, sets, games, and points for each pair in that group

### Requirement: System ranks group standings deterministically
The system SHALL rank pairs by points, matches won, set differential, game differential, games won, and head-to-head when exactly two pairs are tied.

#### Scenario: Rank tied pairs
- **WHEN** two pairs have the same points and matches won
- **THEN** the system applies the next ranking criteria in order until the tie is resolved or flagged

### Requirement: System resolves multi-pair ties with a mini-table
The system SHALL resolve ties between three or more pairs by recalculating tie-break criteria using only matches played among the tied pairs.

#### Scenario: Resolve triple tie by mini-table
- **WHEN** three pairs are tied on points in the same group
- **THEN** the system ranks those tied pairs by mini-table points, matches won, set differential, game differential, and games won

#### Scenario: Multi-pair tie remains unresolved
- **WHEN** tied pairs remain tied after mini-table criteria are applied
- **THEN** the system flags the tie for organizer review

### Requirement: System identifies playoff qualifiers
The system SHALL identify playoff qualifiers from group standings based on the configured number of qualifying positions.

#### Scenario: Top pairs qualify
- **WHEN** all required group matches are complete
- **THEN** the system marks the configured top-ranked pairs from each group as playoff qualifiers

### Requirement: System flags unresolved ties
The system SHALL flag standings ties that remain unresolved after applying configured tie-break criteria.

#### Scenario: Unresolved tie remains
- **WHEN** two or more pairs remain tied after all ranking criteria
- **THEN** the system indicates that organizer review is required before playoff seeding
