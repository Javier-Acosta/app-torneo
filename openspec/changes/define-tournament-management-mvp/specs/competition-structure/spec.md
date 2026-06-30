## ADDED Requirements

### Requirement: Tournament supports group-stage plus playoff format
The system SHALL support tournaments that begin with groups and advance qualifying pairs into a playoff bracket.

#### Scenario: Configure group and playoff structure
- **WHEN** the organizer defines groups and playoff size for a category
- **THEN** the system stores the category structure as group-stage plus playoff

### Requirement: Playoff size is configurable per category
The system SHALL allow the organizer to configure playoff bracket size independently for each category using supported bracket sizes.

#### Scenario: Configure category playoff size
- **WHEN** the organizer sets one category to a 4-pair playoff and another category to an 8-pair playoff
- **THEN** the system stores each playoff size on its own category structure

#### Scenario: Reject incompatible playoff size
- **WHEN** the organizer selects a playoff size that cannot be filled from the category's confirmed pairs or configured qualifiers
- **THEN** the system prevents saving the incompatible playoff configuration

### Requirement: Organizer can assign pairs to groups
The system SHALL allow confirmed pairs to be assigned to named groups within their category.

#### Scenario: Assign pair to group
- **WHEN** the organizer assigns a confirmed pair to Group A
- **THEN** the system includes that pair in Group A standings and group fixtures

### Requirement: Organizer can generate groups automatically
The system SHALL allow the organizer to automatically distribute confirmed pairs into a selected number of groups within a category.

#### Scenario: Generate balanced groups
- **WHEN** the organizer requests automatic group generation for confirmed pairs in a category
- **THEN** the system creates the selected number of groups and distributes pairs as evenly as possible

#### Scenario: Preserve manual control after generation
- **WHEN** the organizer moves a pair between automatically generated groups
- **THEN** the system saves the manual group assignment as the current group structure

### Requirement: Playoff bracket is seeded from group qualifiers
The system SHALL create playoff participants from qualifying group positions according to the configured playoff size and seeding rules.

#### Scenario: Seed playoff from group winners
- **WHEN** all required group matches are complete and the organizer generates the playoff
- **THEN** the system fills playoff slots with the configured qualifiers from group standings

### Requirement: Competition structure preserves category boundaries
The system SHALL keep groups, matches, standings, and playoff brackets isolated by tournament category.

#### Scenario: View category structure
- **WHEN** the organizer opens one category
- **THEN** the system shows only the groups and playoff for that category
