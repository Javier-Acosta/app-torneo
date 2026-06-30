## Context

The application starts from a fresh Next.js project with no domain model yet. The first product slice is a complete tournament management MVP for one club or organizer. The organizer manages tournaments made of padel pairs, uses a group-stage plus playoff format, enters results manually, and publishes progress through a read-only public view.

The primary stakeholder is the tournament organizer. Players and spectators are secondary stakeholders who need accurate public information without administrative access.

## Goals / Non-Goals

**Goals:**

- Model tournaments, categories, pairs, groups, playoff rounds, matches, results, and standings.
- Support one organizer/club without tenant switching or club-level isolation.
- Let organizers run a tournament from setup through published winners.
- Keep fixture generation and result entry explicit and auditable.
- Make standings and playoff qualification deterministic from recorded results.

**Non-Goals:**

- Multi-club tenancy, organizer marketplaces, or cross-club roles.
- Online payments, invoicing, refunds, or payment provider integration.
- Player self-service accounts, ranking history, notifications, or chat.
- Automated court/time optimization beyond manual scheduling fields.
- Additional formats such as americano, league-only, or elimination-only tournaments.

## Decisions

1. **Single-club domain first**

   The MVP SHALL treat all tournaments as belonging to the same organizer/club. This avoids tenant design, permission boundaries, and billing complexity while validating the core workflow.

   Alternative considered: multi-club support from day one. Rejected for MVP because it would force early account, tenant, and authorization decisions before the tournament workflow is proven.

2. **Pairs are the only participant unit**

   The domain SHALL model tournament entries as pairs composed of two players. Individual registration and later pair assignment are excluded.

   Alternative considered: player-first registration. Rejected for MVP because the user already confirmed tournaments are always pair based.

3. **Group-stage plus playoff is the only initial format**

   The competition structure SHALL support groups followed by playoff brackets. Each category SHALL configure its own playoff bracket size, such as 4, 8, or 16 qualifying pairs, as long as the selected size is compatible with the number of confirmed pairs and group qualifiers. Group setup SHALL support both manual assignment and automatic distribution of confirmed pairs into groups. The data model should keep format-specific concepts explicit instead of pretending all tournament types fit one generic structure.

   Alternative considered: a generic tournament engine. Rejected for MVP because it would add abstraction before additional formats are required.

4. **Manual and automatic group setup**

   The organizer SHALL be able to create groups manually, move pairs between groups, and also ask the system to distribute confirmed pairs automatically across a chosen number of groups. Automatic distribution SHALL balance group sizes as evenly as possible, while manual edits remain the final source of truth.

   Alternative considered: manual-only group setup. Rejected because automatic distribution speeds up common setup work without removing organizer control.

5. **Manual scheduling and result entry**

   The organizer SHALL create or adjust fixtures, assign courts/times, and enter results manually. Score format SHALL be configurable per category using supported presets: best of three sets, best of three with a super tie-break as the deciding set, or single set. Walkovers remain a separate result type without requiring full set scores. The app validates consistency for the category's selected score format but does not automatically optimize schedules.

   Alternative considered: automatic scheduling. Deferred because court availability, rest windows, and club-specific constraints need more discovery.

   Alternative considered: one fixed best-of-three score format. Rejected because different categories often use different match formats based on time, level, and number of pairs.

6. **Deterministic standings**

   Group standings SHALL be recalculated from completed results using a defined ranking order. Ranking order SHALL be points, matches won, set differential, game differential, games won, and head-to-head when exactly two pairs are tied. For ties between three or more pairs, the system SHALL build a mini-table using only matches among the tied pairs and apply points, matches won, set differential, game differential, and games won within that mini-table. Remaining unresolved ties require manual organizer review before playoff seeding.

   Alternative considered: full federation-grade tie-break logic. Deferred until the exact tournament rules are confirmed.

## Risks / Trade-offs

- Ambiguous tie-break rules -> Document the initial order and expose unresolved ties clearly for organizer review.
- Manual fixture management can be time-consuming -> Keep scheduling fields simple and editable; add automation only after observing real tournament operations.
- Public view can expose incorrect draft data -> Require explicit publication states for tournaments and matches.
- Playoff generation depends on complete group data -> Prevent or warn against playoff seeding before required group matches are completed.
- Single-club assumptions can leak into later multi-club work -> Keep organizer/club ownership as a conceptual boundary even if the MVP stores only one club.

## Migration Plan

No data migration is required because the application has no existing domain data. Implementation can introduce the MVP model, screens, and domain logic behind the initial app routes.

Rollback is limited to removing or disabling the new MVP routes and domain objects before real production data exists.

## Open Questions

- None for the MVP specification.
