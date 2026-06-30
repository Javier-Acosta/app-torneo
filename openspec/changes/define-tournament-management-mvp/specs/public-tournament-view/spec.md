## ADDED Requirements

### Requirement: Public users can view published tournaments
The system SHALL provide a read-only public view for tournaments that the organizer has published.

#### Scenario: Open public tournament page
- **WHEN** a public user opens the link for a published tournament
- **THEN** the system shows tournament details without requiring organizer access

### Requirement: Public view shows fixtures and results
The system SHALL show scheduled matches, match states, scores, and winners in the public tournament view.

#### Scenario: View completed match
- **WHEN** a public user views a completed match
- **THEN** the system displays the score and winning pair

### Requirement: Public view shows group standings
The system SHALL show group standings for each published tournament category.

#### Scenario: View group table
- **WHEN** a public user opens a category with group matches
- **THEN** the system displays the current standings for each group

### Requirement: Public view shows playoff progress
The system SHALL show playoff bracket participants, match states, results, and winners when playoff data exists.

#### Scenario: View playoff bracket
- **WHEN** a public user opens a category with a generated playoff
- **THEN** the system displays the current playoff bracket progress

### Requirement: Draft data remains private
The system SHALL prevent public users from viewing tournaments or matches that are not published.

#### Scenario: Open unpublished tournament
- **WHEN** a public user opens a link to an unpublished tournament
- **THEN** the system does not expose tournament details
