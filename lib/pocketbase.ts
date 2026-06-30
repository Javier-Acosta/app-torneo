import type {
  Category,
  Group,
  Match,
  MatchStatus,
  Pair,
  RegistrationStatus,
  ScoreFormat,
  SetScore,
  Tournament,
  TournamentStatus,
} from "@/lib/tournament";

type PocketBaseConfig = {
  url: string;
  superuserEmail?: string;
  superuserPassword?: string;
};

export type PocketBaseHealth = {
  configured: boolean;
  reachable: boolean;
  url?: string;
  message: string;
};

export function getPocketBaseConfig(): PocketBaseConfig {
  const url = process.env.POCKETBASE_URL?.replace(/\/$/, "") ?? "";

  return {
    url,
    superuserEmail: process.env.POCKETBASE_SUPERUSER_EMAIL ?? process.env.POCKETBASE_ADMIN_EMAIL,
    superuserPassword: process.env.POCKETBASE_SUPERUSER_PASSWORD ?? process.env.POCKETBASE_ADMIN_PASSWORD,
  };
}

export function isPocketBaseConfigured() {
  const config = getPocketBaseConfig();
  return Boolean(config.url && config.superuserEmail && config.superuserPassword);
}

export async function checkPocketBaseHealth(): Promise<PocketBaseHealth> {
  const config = getPocketBaseConfig();

  if (!config.url) {
    return {
      configured: false,
      reachable: false,
      message: "POCKETBASE_URL no esta configurado.",
    };
  }

  try {
    const response = await fetch(`${config.url}/api/health`, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });

    return {
      configured: isPocketBaseConfigured(),
      reachable: response.ok,
      url: config.url,
      message: response.ok
        ? "PocketBase responde correctamente."
        : `PocketBase respondio con estado ${response.status}.`,
    };
  } catch {
    return {
      configured: isPocketBaseConfigured(),
      reachable: false,
      url: config.url,
      message: "No se pudo conectar con PocketBase.",
    };
  }
}

export async function getTournamentFromPocketBase(name = "Copa Apertura Padel"): Promise<Tournament | undefined> {
  const client = new PocketBaseServerClient();

  try {
    const tournamentRecord = await client.getFirstRecord<PocketBaseTournamentRecord>(
      "tournaments",
      `name = "${escapeFilterValue(name)}"`,
    );

    if (!tournamentRecord) return undefined;

    const categoryRecords = await client.getFullList<PocketBaseCategoryRecord>(
      "categories",
      `tournament = "${tournamentRecord.id}"`,
      "created",
    );

    const categories = await Promise.all(
      categoryRecords.map(async (categoryRecord) => {
        const [pairRecords, groupRecords, matchRecords] = await Promise.all([
          client.getFullList<PocketBasePairRecord>("pairs", `category = "${categoryRecord.id}"`, "seed"),
          client.getFullList<PocketBaseGroupRecord>("groups", `category = "${categoryRecord.id}"`, "displayOrder"),
          client.getFullList<PocketBaseMatchRecord>("matches", `category = "${categoryRecord.id}"`, "displayOrder"),
        ]);

        const playerIds = Array.from(
          new Set(pairRecords.flatMap((pairRecord) => [pairRecord.playerOne, pairRecord.playerTwo])),
        );
        const playerRecords = await Promise.all(
          playerIds.map((id) => client.getRecord<PocketBasePlayerRecord>("players", id)),
        );
        const playersById = new Map(playerRecords.map((player) => [player.id, player]));

        const pairs: Pair[] = pairRecords.map((pairRecord) => {
          const playerOne = playersById.get(pairRecord.playerOne);
          const playerTwo = playersById.get(pairRecord.playerTwo);

          return {
            id: pairRecord.id,
            seed: pairRecord.seed || undefined,
            status: pairRecord.status,
            players: [
              { id: playerOne?.id ?? pairRecord.playerOne, name: playerOne?.name ?? "Jugador sin nombre" },
              { id: playerTwo?.id ?? pairRecord.playerTwo, name: playerTwo?.name ?? "Jugador sin nombre" },
            ],
          };
        });

        const groups: Group[] = groupRecords.map((groupRecord) => ({
          id: groupRecord.id,
          name: groupRecord.name,
          pairIds: toArray(groupRecord.pairs),
        }));

        const matches: Match[] = matchRecords.map((matchRecord) => ({
          id: matchRecord.id,
          phase: matchRecord.phase,
          categoryId: categoryRecord.id,
          groupId: matchRecord.group || undefined,
          round: matchRecord.round || undefined,
          pairOneId: matchRecord.pairOne,
          pairTwoId: matchRecord.pairTwo,
          status: matchRecord.status,
          court: matchRecord.court || undefined,
          startTime: matchRecord.startTime || undefined,
          order: matchRecord.displayOrder,
          sets: normalizeSets(matchRecord.sets),
          winnerPairId: matchRecord.winnerPair || undefined,
        }));

        return {
          id: categoryRecord.id,
          name: categoryRecord.name,
          capacity: categoryRecord.capacity,
          playoffSize: Number(categoryRecord.playoffSize) as Category["playoffSize"],
          scoreFormat: categoryRecord.scoreFormat,
          qualifierSlotsPerGroup: categoryRecord.qualifierSlotsPerGroup,
          pairs,
          groups,
          matches,
        };
      }),
    );

    return {
      id: tournamentRecord.id,
      name: tournamentRecord.name,
      clubName: tournamentRecord.clubName,
      venue: tournamentRecord.venue,
      dateRange: tournamentRecord.dateRange,
      status: tournamentRecord.status,
      published: tournamentRecord.published,
      categories,
    };
  } catch {
    return undefined;
  }
}

class PocketBaseServerClient {
  private token?: string;
  private readonly config = getPocketBaseConfig();

  async getFirstRecord<T>(collection: string, filter: string) {
    const params = new URLSearchParams({
      page: "1",
      perPage: "1",
      filter,
    });
    const result = await this.request<PocketBaseListResponse<T>>(
      `/api/collections/${collection}/records?${params}`,
    );

    return result.items[0];
  }

  async getRecord<T>(collection: string, id: string) {
    return this.request<T>(`/api/collections/${collection}/records/${id}`);
  }

  async getFullList<T>(collection: string, filter: string, sort?: string) {
    const all: T[] = [];
    let page = 1;
    let totalPages = 1;

    while (page <= totalPages) {
      const params = new URLSearchParams({
        page: String(page),
        perPage: "100",
        filter,
      });
      if (sort) params.set("sort", sort);

      const result = await this.request<PocketBaseListResponse<T>>(
        `/api/collections/${collection}/records?${params}`,
      );
      all.push(...result.items);
      totalPages = result.totalPages;
      page += 1;
    }

    return all;
  }

  private async auth() {
    if (!this.config.url || !this.config.superuserEmail || !this.config.superuserPassword) {
      throw new Error("PocketBase is not configured.");
    }

    const response = await fetch(`${this.config.url}/api/collections/_superusers/auth-with-password`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        identity: this.config.superuserEmail,
        password: this.config.superuserPassword,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error("PocketBase authentication failed.");
    }

    const data = (await response.json()) as { token?: string };
    if (!data.token) throw new Error("PocketBase authentication did not return a token.");
    this.token = data.token;
  }

  private async request<T>(path: string): Promise<T> {
    if (!this.token) await this.auth();

    const response = await fetch(`${this.config.url}${path}`, {
      headers: { authorization: `Bearer ${this.token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`PocketBase request failed with ${response.status}.`);
    }

    return response.json() as Promise<T>;
  }
}

type PocketBaseListResponse<T> = {
  items: T[];
  totalPages: number;
};

type PocketBaseTournamentRecord = {
  id: string;
  name: string;
  clubName: string;
  venue: string;
  dateRange: string;
  status: TournamentStatus;
  published: boolean;
};

type PocketBaseCategoryRecord = {
  id: string;
  name: string;
  capacity: number;
  playoffSize: string;
  scoreFormat: ScoreFormat;
  qualifierSlotsPerGroup: number;
};

type PocketBasePlayerRecord = {
  id: string;
  name: string;
};

type PocketBasePairRecord = {
  id: string;
  playerOne: string;
  playerTwo: string;
  status: RegistrationStatus;
  seed?: number;
};

type PocketBaseGroupRecord = {
  id: string;
  name: string;
  pairs: string[] | string;
};

type PocketBaseMatchRecord = {
  id: string;
  group?: string;
  phase: "group" | "playoff";
  round?: string;
  pairOne: string;
  pairTwo: string;
  status: MatchStatus;
  court?: string;
  startTime?: string;
  displayOrder: number;
  winnerPair?: string;
  sets?: unknown;
};

function escapeFilterValue(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function toArray(value: string[] | string | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeSets(value: unknown): SetScore[] {
  if (!Array.isArray(value)) return [];

  const sets: SetScore[] = [];

  for (const set of value) {
    if (!isRecord(set)) continue;
    const pairOneGames = Number(set.pairOneGames);
    const pairTwoGames = Number(set.pairTwoGames);
    if (!Number.isFinite(pairOneGames) || !Number.isFinite(pairTwoGames)) continue;

    sets.push({
      pairOneGames,
      pairTwoGames,
      kind: set.kind === "super-tiebreak" ? "super-tiebreak" : "regular",
    });
  }

  return sets;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
