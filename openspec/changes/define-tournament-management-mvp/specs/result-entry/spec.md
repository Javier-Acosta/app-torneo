## ADDED Requirements

### Requirement: Organizer can enter match scores
The system SHALL allow the organizer to enter set and game scores for a match and identify the winning pair.

#### Scenario: Enter completed result
- **WHEN** the organizer enters a valid completed score for a scheduled match
- **THEN** the system marks the match as completed and records the winner

### Requirement: Score format is configurable per category
The system SHALL allow each category to use one supported score format for all matches in that category.

#### Scenario: Configure category score format
- **WHEN** the organizer selects a supported score format for a category
- **THEN** the system applies that format to result validation for matches in that category

### Requirement: System supports best of three sets
The system SHALL validate best-of-three-set match scores where the winner is the pair that wins two full sets.

#### Scenario: Save best-of-three result
- **WHEN** the organizer enters a best-of-three score where one pair wins two sets
- **THEN** the system accepts the score and records that pair as the winner

#### Scenario: Reject best-of-three without two-set winner
- **WHEN** the organizer enters a completed score where no pair has won two sets
- **THEN** the system prevents saving the result

### Requirement: System supports super tie-break deciding set
The system SHALL validate best-of-three match scores where the deciding third set can be recorded as a super tie-break.

#### Scenario: Save super tie-break result
- **WHEN** the organizer enters a score with one set won by each pair and a super tie-break won by one pair
- **THEN** the system accepts the score and records the super-tie-break-winning pair as the winner

### Requirement: System supports single-set matches
The system SHALL validate single-set match scores where the winner is the pair that wins the configured single set.

#### Scenario: Save single-set result
- **WHEN** the organizer enters a valid single-set score with one winning pair
- **THEN** the system accepts the score and records that pair as the winner

### Requirement: System validates result consistency
The system SHALL reject scores that do not produce a valid winner or conflict with the selected winner.

#### Scenario: Invalid winner selection
- **WHEN** the organizer selects a winner that does not match the entered score
- **THEN** the system prevents saving the result

### Requirement: Organizer can record walkovers
The system SHALL allow the organizer to mark a match as walkover and select the pair that advances or receives the win.

#### Scenario: Record walkover
- **WHEN** the organizer marks Pair A as winning by walkover
- **THEN** the system records the match as walkover with Pair A as winner

### Requirement: Completed results update downstream calculations
The system SHALL use completed and walkover results when calculating standings and playoff progress.

#### Scenario: Result affects standings
- **WHEN** a group match result is saved
- **THEN** the system includes that result in the group standings calculation
