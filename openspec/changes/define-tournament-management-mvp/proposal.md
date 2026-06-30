## Why

Tournament organizers need a single place to configure, run, and publish a real padel tournament without relying on spreadsheets, chat messages, and manual table calculations. Starting with a focused MVP lets the product support a common tournament shape end to end: pairs, group stage, playoff, manual results, and a public follow-up view.

## What Changes

- Introduce tournament management for a single club or organizer.
- Allow organizers to create tournaments with categories, dates, venue information, and tournament status.
- Manage participants as pairs only, including registration state and basic pair/player data.
- Support a group-stage plus playoff competition format as the initial tournament format.
- Let organizers create and manage matches, including group matches, playoff matches, schedules, courts, and match states.
- Let organizers enter match results manually, including completed matches and walkovers.
- Calculate group standings and determine playoff qualifiers from group results.
- Provide a public read-only tournament view for players and spectators to see fixtures, results, standings, and playoff progress.

## Capabilities

### New Capabilities

- `tournament-management`: Covers creating, editing, and operating tournaments for one club or organizer.
- `pair-registration`: Covers managing player pairs and their participation in a tournament.
- `competition-structure`: Covers configuring and representing group-stage plus playoff tournament structures.
- `match-scheduling`: Covers fixtures, courts, times, and match lifecycle management.
- `result-entry`: Covers manual score entry, result validation, winners, and walkovers.
- `standings-calculation`: Covers group tables, ranking rules, and playoff qualification.
- `public-tournament-view`: Covers the read-only player/spectator view of tournament progress.

### Modified Capabilities

- None.

## Impact

- Adds the first product-domain specifications for the tournament management app.
- Future implementation will affect the Next.js application, data model, UI flows, and domain logic for tournaments, pairs, matches, results, and standings.
- No external integrations, multi-club tenancy, online payments, notifications, ranking history, or automated court optimization are included in this MVP.
