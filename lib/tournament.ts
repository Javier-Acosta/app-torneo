export type TournamentStatus =
  | "draft"
  | "registration-open"
  | "registration-closed"
  | "in-progress"
  | "completed"
  | "cancelled";

export type RegistrationStatus =
  | "pending"
  | "confirmed"
  | "waitlisted"
  | "withdrawn"
  | "disqualified";

export type ScoreFormat = "best-of-three" | "super-tiebreak" | "single-set";

export type MatchStatus =
  | "pending"
  | "scheduled"
  | "in-progress"
  | "completed"
  | "walkover"
  | "cancelled"
  | "postponed";

export type Player = {
  id: string;
  name: string;
};

export type Pair = {
  id: string;
  players: [Player, Player];
  status: RegistrationStatus;
  seed?: number;
};

export type Group = {
  id: string;
  name: string;
  pairIds: string[];
};

export type SetScore = {
  pairOneGames: number;
  pairTwoGames: number;
  kind?: "regular" | "super-tiebreak";
};

export type Match = {
  id: string;
  phase: "group" | "playoff";
  categoryId: string;
  groupId?: string;
  round?: string;
  pairOneId: string;
  pairTwoId: string;
  status: MatchStatus;
  court?: string;
  startTime?: string;
  order: number;
  sets: SetScore[];
  winnerPairId?: string;
};

export type Category = {
  id: string;
  name: string;
  capacity: number;
  playoffSize: 4 | 8 | 16;
  scoreFormat: ScoreFormat;
  qualifierSlotsPerGroup: number;
  pairs: Pair[];
  groups: Group[];
  matches: Match[];
};

export type Tournament = {
  id: string;
  name: string;
  clubName: string;
  venue: string;
  dateRange: string;
  status: TournamentStatus;
  published: boolean;
  categories: Category[];
};

export type StandingRow = {
  pairId: string;
  pairName: string;
  played: number;
  points: number;
  wins: number;
  losses: number;
  setsWon: number;
  setsLost: number;
  setDiff: number;
  gamesWon: number;
  gamesLost: number;
  gameDiff: number;
  gamesFor: number;
  needsReview: boolean;
};

export type PlayoffSlot = {
  seed: number;
  pairId?: string;
  pairName: string;
  source: string;
  needsReview: boolean;
};

export const scoreFormatLabels: Record<ScoreFormat, string> = {
  "best-of-three": "Mejor de 3 sets",
  "super-tiebreak": "Mejor de 3 + super tie-break",
  "single-set": "Set unico",
};

export const statusLabels: Record<TournamentStatus, string> = {
  draft: "Borrador",
  "registration-open": "Inscripcion abierta",
  "registration-closed": "Inscripcion cerrada",
  "in-progress": "En juego",
  completed: "Finalizado",
  cancelled: "Cancelado",
};

export const registrationLabels: Record<RegistrationStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  waitlisted: "Lista de espera",
  withdrawn: "Baja",
  disqualified: "Descalificada",
};

export function pairName(pair: Pair) {
  return `${pair.players[0].name} / ${pair.players[1].name}`;
}

export function generateBalancedGroups(pairs: Pair[], groupCount: number): Group[] {
  const confirmed = pairs.filter((pair) => pair.status === "confirmed");
  const groups = Array.from({ length: groupCount }, (_, index) => ({
    id: `g${index + 1}`,
    name: `Grupo ${String.fromCharCode(65 + index)}`,
    pairIds: [] as string[],
  }));

  confirmed.forEach((pair, index) => {
    groups[index % groupCount].pairIds.push(pair.id);
  });

  return groups;
}

export function validateScore(
  format: ScoreFormat,
  sets: SetScore[],
  winnerPairId: string,
  pairOneId: string,
  pairTwoId: string,
) {
  const wins = countSetWins(sets);
  const inferredWinner =
    wins.pairOne > wins.pairTwo ? pairOneId : wins.pairTwo > wins.pairOne ? pairTwoId : undefined;

  if (!inferredWinner || inferredWinner !== winnerPairId) {
    return false;
  }

  if (format === "single-set") {
    return sets.length === 1 && Math.max(wins.pairOne, wins.pairTwo) === 1;
  }

  if (format === "super-tiebreak") {
    const hasBreaker = sets.some((set) => set.kind === "super-tiebreak");
    return sets.length >= 2 && sets.length <= 3 && Math.max(wins.pairOne, wins.pairTwo) === 2 && hasBreaker;
  }

  return sets.length >= 2 && sets.length <= 3 && Math.max(wins.pairOne, wins.pairTwo) === 2;
}

export function calculateGroupStandings(category: Category, group: Group): StandingRow[] {
  const rows = new Map<string, StandingRow>();
  const pairsById = new Map(category.pairs.map((pair) => [pair.id, pair]));

  for (const pairId of group.pairIds) {
    const pair = pairsById.get(pairId);
    if (!pair) continue;
    rows.set(pairId, emptyRow(pair));
  }

  const groupMatches = category.matches.filter(
    (match) =>
      match.phase === "group" &&
      match.groupId === group.id &&
      (match.status === "completed" || match.status === "walkover"),
  );

  for (const match of groupMatches) {
    const one = rows.get(match.pairOneId);
    const two = rows.get(match.pairTwoId);
    if (!one || !two || !match.winnerPairId) continue;

    one.played += 1;
    two.played += 1;

    if (match.winnerPairId === one.pairId) {
      one.wins += 1;
      two.losses += 1;
      one.points += 2;
    } else {
      two.wins += 1;
      one.losses += 1;
      two.points += 2;
    }

    for (const set of match.sets) {
      one.gamesWon += set.pairOneGames;
      one.gamesLost += set.pairTwoGames;
      two.gamesWon += set.pairTwoGames;
      two.gamesLost += set.pairOneGames;

      if (set.pairOneGames > set.pairTwoGames) {
        one.setsWon += 1;
        two.setsLost += 1;
      } else if (set.pairTwoGames > set.pairOneGames) {
        two.setsWon += 1;
        one.setsLost += 1;
      }
    }
  }

  const standings = Array.from(rows.values()).map((row) => ({
    ...row,
    setDiff: row.setsWon - row.setsLost,
    gameDiff: row.gamesWon - row.gamesLost,
    gamesFor: row.gamesWon,
  }));

  return rankRows(standings, groupMatches);
}

export function playoffSlots(category: Category): PlayoffSlot[] {
  const slots: PlayoffSlot[] = [];

  for (const group of category.groups) {
    const standings = calculateGroupStandings(category, group);
    standings.slice(0, category.qualifierSlotsPerGroup).forEach((row, index) => {
      slots.push({
        seed: slots.length + 1,
        pairId: row.needsReview ? undefined : row.pairId,
        pairName: row.needsReview ? "Requiere revision" : row.pairName,
        source: `${group.name} #${index + 1}`,
        needsReview: row.needsReview,
      });
    });
  }

  return slots.slice(0, category.playoffSize);
}

export function formatScore(match: Match) {
  if (match.status === "walkover") return "WO";
  if (match.sets.length === 0) return "-";

  return match.sets
    .map((set) => `${set.pairOneGames}-${set.pairTwoGames}${set.kind === "super-tiebreak" ? " STB" : ""}`)
    .join(", ");
}

export const demoTournament: Tournament = {
  id: "torneo-demo",
  name: "Copa Apertura Padel",
  clubName: "Club Central Padel",
  venue: "Complejo Norte",
  dateRange: "12 al 14 de julio",
  status: "in-progress",
  published: true,
  categories: [
    {
      id: "quinta-caballeros",
      name: "5ta Caballeros",
      capacity: 12,
      playoffSize: 4,
      scoreFormat: "best-of-three",
      qualifierSlotsPerGroup: 2,
      pairs: [
        pair("p1", "Javier Acosta", "Nico Perez", "confirmed", 1),
        pair("p2", "Martin Silva", "Leo Gomez", "confirmed", 2),
        pair("p3", "Tomas Ruiz", "Santi Molina", "confirmed", 3),
        pair("p4", "Pablo Arias", "Diego Castro", "confirmed", 4),
        pair("p5", "Facu Torres", "Ivan Rojas", "confirmed", 5),
        pair("p6", "Bruno Gil", "Marcos Vega", "confirmed", 6),
        pair("p7", "Lucas Ferreyra", "Alan Diaz", "waitlisted"),
      ],
      groups: [
        { id: "g1", name: "Grupo A", pairIds: ["p1", "p3", "p5"] },
        { id: "g2", name: "Grupo B", pairIds: ["p2", "p4", "p6"] },
      ],
      matches: [
        match("m1", "g1", "p1", "p3", "completed", "p1", [
          { pairOneGames: 6, pairTwoGames: 4 },
          { pairOneGames: 6, pairTwoGames: 3 },
        ], "Cancha 1", "Viernes 19:00"),
        match("m2", "g1", "p3", "p5", "completed", "p5", [
          { pairOneGames: 4, pairTwoGames: 6 },
          { pairOneGames: 6, pairTwoGames: 7 },
        ], "Cancha 2", "Viernes 20:00"),
        match("m3", "g1", "p1", "p5", "scheduled", undefined, [], "Cancha 1", "Sabado 10:00"),
        match("m4", "g2", "p2", "p4", "completed", "p2", [
          { pairOneGames: 6, pairTwoGames: 2 },
          { pairOneGames: 6, pairTwoGames: 1 },
        ], "Cancha 3", "Viernes 19:00"),
        match("m5", "g2", "p4", "p6", "walkover", "p6", [], "Cancha 2", "Sabado 09:00"),
        match("m6", "g2", "p2", "p6", "scheduled", undefined, [], "Cancha 3", "Sabado 11:00"),
      ],
    },
    {
      id: "sexta-mixto",
      name: "6ta Mixto",
      capacity: 8,
      playoffSize: 4,
      scoreFormat: "super-tiebreak",
      qualifierSlotsPerGroup: 2,
      pairs: [
        pair("x1", "Ana Lopez", "Juan Rey", "confirmed", 1),
        pair("x2", "Sofia Paz", "Mateo Luna", "confirmed", 2),
        pair("x3", "Clara Sosa", "Eze Robles", "confirmed", 3),
        pair("x4", "Mica Vera", "Fran Ortiz", "pending"),
      ],
      groups: [{ id: "g1", name: "Grupo A", pairIds: ["x1", "x2", "x3"] }],
      matches: [
        {
          ...match("mx1", "g1", "x1", "x2", "completed", "x1", [
            { pairOneGames: 6, pairTwoGames: 3 },
            { pairOneGames: 4, pairTwoGames: 6 },
            { pairOneGames: 10, pairTwoGames: 7, kind: "super-tiebreak" },
          ], "Cancha 4", "Viernes 21:00"),
          categoryId: "sexta-mixto",
        },
      ],
    },
  ],
};

function pair(
  id: string,
  first: string,
  second: string,
  status: RegistrationStatus,
  seed?: number,
): Pair {
  return {
    id,
    seed,
    status,
    players: [
      { id: `${id}-1`, name: first },
      { id: `${id}-2`, name: second },
    ],
  };
}

function match(
  id: string,
  groupId: string,
  pairOneId: string,
  pairTwoId: string,
  status: MatchStatus,
  winnerPairId: string | undefined,
  sets: SetScore[],
  court: string,
  startTime: string,
): Match {
  return {
    id,
    phase: "group",
    categoryId: "quinta-caballeros",
    groupId,
    pairOneId,
    pairTwoId,
    status,
    court,
    startTime,
    order: Number(id.replace(/\D/g, "")) || 1,
    sets,
    winnerPairId,
  };
}

function emptyRow(pair: Pair): StandingRow {
  return {
    pairId: pair.id,
    pairName: pairName(pair),
    played: 0,
    points: 0,
    wins: 0,
    losses: 0,
    setsWon: 0,
    setsLost: 0,
    setDiff: 0,
    gamesWon: 0,
    gamesLost: 0,
    gameDiff: 0,
    gamesFor: 0,
    needsReview: false,
  };
}

function countSetWins(sets: SetScore[]) {
  return sets.reduce(
    (wins, set) => {
      if (set.pairOneGames > set.pairTwoGames) wins.pairOne += 1;
      if (set.pairTwoGames > set.pairOneGames) wins.pairTwo += 1;
      return wins;
    },
    { pairOne: 0, pairTwo: 0 },
  );
}

function rankRows(rows: StandingRow[], matches: Match[]) {
  const sorted = [...rows].sort(compareCoreRows);
  const tiedGroups = groupByTie(sorted);

  return tiedGroups.flatMap((group) => {
    if (group.length === 1) return group;
    if (group.length === 2) return resolveHeadToHead(group, matches);
    return resolveMiniTable(group, matches);
  });
}

function compareCoreRows(a: StandingRow, b: StandingRow) {
  return (
    b.points - a.points ||
    b.wins - a.wins ||
    b.setDiff - a.setDiff ||
    b.gameDiff - a.gameDiff ||
    b.gamesFor - a.gamesFor ||
    a.pairName.localeCompare(b.pairName)
  );
}

function groupByTie(rows: StandingRow[]) {
  const groups: StandingRow[][] = [];

  for (const row of rows) {
    const last = groups[groups.length - 1];
    if (!last || compareTieValues(last[0], row) !== 0) {
      groups.push([row]);
    } else {
      last.push(row);
    }
  }

  return groups;
}

function compareTieValues(a: StandingRow, b: StandingRow) {
  return (
    b.points - a.points ||
    b.wins - a.wins ||
    b.setDiff - a.setDiff ||
    b.gameDiff - a.gameDiff ||
    b.gamesFor - a.gamesFor
  );
}

function resolveHeadToHead(rows: StandingRow[], matches: Match[]) {
  const [a, b] = rows;
  const direct = matches.find(
    (match) =>
      match.status !== "scheduled" &&
      ((match.pairOneId === a.pairId && match.pairTwoId === b.pairId) ||
        (match.pairOneId === b.pairId && match.pairTwoId === a.pairId)),
  );

  if (!direct?.winnerPairId) {
    return rows.map((row) => ({ ...row, needsReview: true }));
  }

  return [...rows].sort((left, right) =>
    left.pairId === direct.winnerPairId ? -1 : right.pairId === direct.winnerPairId ? 1 : 0,
  );
}

function resolveMiniTable(rows: StandingRow[], matches: Match[]) {
  const tiedIds = new Set(rows.map((row) => row.pairId));
  const miniMatches = matches.filter(
    (match) =>
      tiedIds.has(match.pairOneId) &&
      tiedIds.has(match.pairTwoId) &&
      (match.status === "completed" || match.status === "walkover"),
  );

  const miniRows = new Map(rows.map((row) => [row.pairId, { ...row, played: 0, points: 0, wins: 0, losses: 0, setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0, setDiff: 0, gameDiff: 0, gamesFor: 0 }]));

  for (const match of miniMatches) {
    const one = miniRows.get(match.pairOneId);
    const two = miniRows.get(match.pairTwoId);
    if (!one || !two || !match.winnerPairId) continue;
    one.played += 1;
    two.played += 1;
    if (match.winnerPairId === one.pairId) {
      one.wins += 1;
      one.points += 2;
      two.losses += 1;
    } else {
      two.wins += 1;
      two.points += 2;
      one.losses += 1;
    }
    for (const set of match.sets) {
      one.gamesWon += set.pairOneGames;
      one.gamesLost += set.pairTwoGames;
      two.gamesWon += set.pairTwoGames;
      two.gamesLost += set.pairOneGames;
      if (set.pairOneGames > set.pairTwoGames) {
        one.setsWon += 1;
        two.setsLost += 1;
      } else if (set.pairTwoGames > set.pairOneGames) {
        two.setsWon += 1;
        one.setsLost += 1;
      }
    }
  }

  const ranked = Array.from(miniRows.values())
    .map((row) => ({
      ...row,
      setDiff: row.setsWon - row.setsLost,
      gameDiff: row.gamesWon - row.gamesLost,
      gamesFor: row.gamesWon,
    }))
    .sort(compareCoreRows);

  const unresolved = groupByTie(ranked).some((group) => group.length > 1);
  return ranked.map((row) => ({
    ...rows.find((original) => original.pairId === row.pairId)!,
    needsReview: unresolved,
  }));
}
