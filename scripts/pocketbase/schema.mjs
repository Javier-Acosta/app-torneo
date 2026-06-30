import { PocketBaseAdminClient } from "./client.mjs";

const publicListRule = "published = true";
const publicViewRule = "published = true";

const collections = [
  {
    name: "tournaments",
    type: "base",
    listRule: publicListRule,
    viewRule: publicViewRule,
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      text("name", true),
      text("clubName", true),
      text("venue", true),
      text("dateRange", true),
      select("status", ["draft", "registration-open", "registration-closed", "in-progress", "completed", "cancelled"], true),
      bool("published"),
    ],
  },
  {
    name: "categories",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      relation("tournament", "tournaments", true),
      text("name", true),
      number("capacity", true, 1),
      select("playoffSize", ["4", "8", "16"], true),
      select("scoreFormat", ["best-of-three", "super-tiebreak", "single-set"], true),
      number("qualifierSlotsPerGroup", true, 1),
    ],
  },
  {
    name: "players",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [text("name", true)],
  },
  {
    name: "pairs",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      relation("category", "categories", true),
      relation("playerOne", "players", true),
      relation("playerTwo", "players", true),
      select("status", ["pending", "confirmed", "waitlisted", "withdrawn", "disqualified"], true),
      number("seed", false, 1),
    ],
  },
  {
    name: "groups",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      relation("category", "categories", true),
      text("name", true),
      relation("pairs", "pairs", false, 99),
      number("displayOrder", true, 1),
    ],
  },
  {
    name: "matches",
    type: "base",
    listRule: "",
    viewRule: "",
    createRule: null,
    updateRule: null,
    deleteRule: null,
    fields: [
      relation("category", "categories", true),
      relation("group", "groups", false),
      select("phase", ["group", "playoff"], true),
      text("round", false),
      relation("pairOne", "pairs", true),
      relation("pairTwo", "pairs", true),
      select("status", ["pending", "scheduled", "in-progress", "completed", "walkover", "cancelled", "postponed"], true),
      text("court", false),
      text("startTime", false),
      number("displayOrder", true, 1),
      relation("winnerPair", "pairs", false),
      json("sets"),
    ],
  },
];

const client = new PocketBaseAdminClient();
await client.auth();

for (const collection of collections) {
  const result = await client.upsertCollection(collection);
  console.log(`${result}: ${collection.name}`);
}

function text(name, required) {
  return {
    name,
    type: "text",
    required,
    min: 0,
    max: 0,
    pattern: "",
  };
}

function bool(name) {
  return {
    name,
    type: "bool",
    required: false,
  };
}

function number(name, required, min = null) {
  return {
    name,
    type: "number",
    required,
    min,
    max: null,
    noDecimal: true,
  };
}

function select(name, values, required) {
  return {
    name,
    type: "select",
    required,
    maxSelect: 1,
    values,
  };
}

function relation(name, collectionName, required, maxSelect = 1) {
  return {
    name,
    type: "relation",
    required,
    collectionId: collectionName,
    cascadeDelete: false,
    minSelect: required ? 1 : null,
    maxSelect,
    displayFields: [],
  };
}

function json(name) {
  return {
    name,
    type: "json",
    required: false,
    maxSize: 2000000,
  };
}
