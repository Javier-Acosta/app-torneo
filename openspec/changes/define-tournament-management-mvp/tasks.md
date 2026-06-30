## 1. Technical Orientation

- [x] 1.1 Read the relevant Next.js 16 documentation from `node_modules/next/dist/docs/` before changing application code.
- [x] 1.2 Inspect the existing app structure and decide the route layout for organizer and public tournament views.
- [x] 1.3 Define the initial domain model for tournaments, categories, pairs, players, groups, matches, results, standings, and playoff brackets.

## 2. Tournament and Pair Management

- [x] 2.1 Implement tournament creation and editing for a single club or organizer.
- [x] 2.2 Implement tournament status transitions for draft, registration-open, registration-closed, in-progress, completed, and cancelled.
- [x] 2.3 Implement pair registration with exactly two players per entry.
- [x] 2.4 Implement pair registration states and capacity handling for confirmed and waitlisted pairs.

## 3. Competition Structure

- [x] 3.1 Implement category setup for group-stage plus playoff format.
- [x] 3.2 Implement manual group creation and pair assignment within each category.
- [x] 3.3 Implement automatic balanced group generation for confirmed pairs.
- [ ] 3.4 Implement playoff bracket setup from configured group qualifiers.
- [ ] 3.5 Prevent playoff seeding when required group matches are incomplete or unresolved ties require review.

## 4. Matches and Results

- [ ] 4.1 Implement group match creation between pairs in the same group and category.
- [ ] 4.2 Implement match scheduling fields for date, time, court, and display order.
- [ ] 4.3 Implement match lifecycle states and organizer edits for unfinished matches.
- [ ] 4.4 Implement per-category score format configuration and manual result entry validation for supported presets.
- [ ] 4.5 Implement walkover result entry.

## 5. Standings and Qualification

- [x] 5.1 Implement group standings calculation from completed and walkover group matches.
- [x] 5.2 Implement ranking by points, matches won, set differential, game differential, games won, and two-pair head-to-head.
- [x] 5.3 Implement mini-table tie-breaks for ties between three or more pairs.
- [x] 5.4 Implement unresolved tie detection and organizer-facing review state.
- [x] 5.5 Implement playoff qualifier identification from standings.

## 6. Public Tournament View

- [x] 6.1 Implement publication controls for tournaments and public visibility.
- [x] 6.2 Implement public tournament overview with categories and basic tournament details.
- [x] 6.3 Implement public fixtures and results view.
- [x] 6.4 Implement public group standings view.
- [x] 6.5 Implement public playoff bracket progress view.

## 7. Verification

- [ ] 7.1 Add focused tests for result validation, standings calculation, qualifier selection, and unresolved tie detection.
- [ ] 7.2 Add workflow coverage for creating a tournament, registering pairs, scheduling matches, entering results, and viewing public progress.
- [x] 7.3 Run lint/build/test checks available in the project and fix MVP-related failures.
