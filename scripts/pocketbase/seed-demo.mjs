import { PocketBaseAdminClient } from "./client.mjs";

const client = new PocketBaseAdminClient();
await client.auth();

const existing = await client.getFirstRecord("tournaments", 'name = "Copa Apertura Padel"');
if (existing) {
  console.log("demo seed skipped: Copa Apertura Padel already exists");
  process.exit(0);
}

const tournament = await client.createRecord("tournaments", {
  name: "Copa Apertura Padel",
  clubName: "Club Central Padel",
  venue: "Complejo Norte",
  dateRange: "12 al 14 de julio",
  status: "in-progress",
  published: true,
});

const category = await client.createRecord("categories", {
  tournament: tournament.id,
  name: "5ta Caballeros",
  capacity: 12,
  playoffSize: "4",
  scoreFormat: "best-of-three",
  qualifierSlotsPerGroup: 2,
});

const pairs = {};
for (const item of [
  ["p1", "Javier Acosta", "Nico Perez", "confirmed", 1],
  ["p2", "Martin Silva", "Leo Gomez", "confirmed", 2],
  ["p3", "Tomas Ruiz", "Santi Molina", "confirmed", 3],
  ["p4", "Pablo Arias", "Diego Castro", "confirmed", 4],
  ["p5", "Facu Torres", "Ivan Rojas", "confirmed", 5],
  ["p6", "Bruno Gil", "Marcos Vega", "confirmed", 6],
  ["p7", "Lucas Ferreyra", "Alan Diaz", "waitlisted", undefined],
]) {
  const [key, oneName, twoName, status, seed] = item;
  const one = await client.createRecord("players", { name: oneName });
  const two = await client.createRecord("players", { name: twoName });
  pairs[key] = await client.createRecord("pairs", {
    category: category.id,
    playerOne: one.id,
    playerTwo: two.id,
    status,
    seed,
  });
}

const groupA = await client.createRecord("groups", {
  category: category.id,
  name: "Grupo A",
  pairs: [pairs.p1.id, pairs.p3.id, pairs.p5.id],
  displayOrder: 1,
});

const groupB = await client.createRecord("groups", {
  category: category.id,
  name: "Grupo B",
  pairs: [pairs.p2.id, pairs.p4.id, pairs.p6.id],
  displayOrder: 2,
});

await createMatch("group", groupA.id, pairs.p1.id, pairs.p3.id, "completed", pairs.p1.id, [
  { pairOneGames: 6, pairTwoGames: 4 },
  { pairOneGames: 6, pairTwoGames: 3 },
], "Cancha 1", "Viernes 19:00", 1);
await createMatch("group", groupA.id, pairs.p3.id, pairs.p5.id, "completed", pairs.p5.id, [
  { pairOneGames: 4, pairTwoGames: 6 },
  { pairOneGames: 6, pairTwoGames: 7 },
], "Cancha 2", "Viernes 20:00", 2);
await createMatch("group", groupA.id, pairs.p1.id, pairs.p5.id, "scheduled", undefined, [], "Cancha 1", "Sabado 10:00", 3);
await createMatch("group", groupB.id, pairs.p2.id, pairs.p4.id, "completed", pairs.p2.id, [
  { pairOneGames: 6, pairTwoGames: 2 },
  { pairOneGames: 6, pairTwoGames: 1 },
], "Cancha 3", "Viernes 19:00", 4);
await createMatch("group", groupB.id, pairs.p4.id, pairs.p6.id, "walkover", pairs.p6.id, [], "Cancha 2", "Sabado 09:00", 5);
await createMatch("group", groupB.id, pairs.p2.id, pairs.p6.id, "scheduled", undefined, [], "Cancha 3", "Sabado 11:00", 6);

console.log("demo seed created: Copa Apertura Padel");

async function createMatch(phase, group, pairOne, pairTwo, status, winnerPair, sets, court, startTime, displayOrder) {
  await client.createRecord("matches", {
    category: category.id,
    group,
    phase,
    pairOne,
    pairTwo,
    status,
    winnerPair,
    sets,
    court,
    startTime,
    displayOrder,
  });
}
