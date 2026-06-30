#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import path from "node:path";

const serverVersion = "0.1.0";
const serverName = "mcp-app-torneo";
const serverDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(serverDir, "..");

const tools = [
  {
    name: "app_context",
    description:
      "Return high-level context for the App Torneo project and its MVP scope.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "openspec_change",
    description:
      "Read OpenSpec change artifacts for the tournament management MVP.",
    inputSchema: {
      type: "object",
      properties: {
        artifact: {
          type: "string",
          enum: [
            "proposal",
            "design",
            "tasks",
            "competition-structure",
            "match-scheduling",
            "pair-registration",
            "public-tournament-view",
            "result-entry",
            "standings-calculation",
            "tournament-management",
          ],
        },
      },
      required: ["artifact"],
      additionalProperties: false,
    },
  },
  {
    name: "env_keys",
    description:
      "Return the expected environment variable names without exposing values.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
  },
];

const artifactPaths = {
  proposal:
    "openspec/changes/define-tournament-management-mvp/proposal.md",
  design: "openspec/changes/define-tournament-management-mvp/design.md",
  tasks: "openspec/changes/define-tournament-management-mvp/tasks.md",
  "competition-structure":
    "openspec/changes/define-tournament-management-mvp/specs/competition-structure/spec.md",
  "match-scheduling":
    "openspec/changes/define-tournament-management-mvp/specs/match-scheduling/spec.md",
  "pair-registration":
    "openspec/changes/define-tournament-management-mvp/specs/pair-registration/spec.md",
  "public-tournament-view":
    "openspec/changes/define-tournament-management-mvp/specs/public-tournament-view/spec.md",
  "result-entry":
    "openspec/changes/define-tournament-management-mvp/specs/result-entry/spec.md",
  "standings-calculation":
    "openspec/changes/define-tournament-management-mvp/specs/standings-calculation/spec.md",
  "tournament-management":
    "openspec/changes/define-tournament-management-mvp/specs/tournament-management/spec.md",
};

function send(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function result(id, payload) {
  send({
    jsonrpc: "2.0",
    id,
    result: payload,
  });
}

function error(id, code, message) {
  send({
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
    },
  });
}

async function readRepoFile(relativePath) {
  const target = path.resolve(repoRoot, relativePath);

  if (!target.startsWith(repoRoot)) {
    throw new Error("Refusing to read outside the App Torneo repository.");
  }

  return readFile(target, "utf8");
}

async function callTool(name, args = {}) {
  if (name === "app_context") {
    return {
      content: [
        {
          type: "text",
          text: [
            "App Torneo is a Next.js app for managing padel tournaments for a single organizer or club.",
            "",
            "Current MVP scope:",
            "- Organizers create tournaments by category and configure group stage plus playoffs.",
            "- Pairs can be registered manually and assigned to groups manually or automatically.",
            "- Matches are scheduled for group and playoff rounds.",
            "- Results use configurable best-of-3 scoring.",
            "- Group standings use detailed tie-breakers.",
            "- Public tournament views expose categories, fixtures, results, standings, and playoff brackets.",
          ].join("\n"),
        },
      ],
    };
  }

  if (name === "openspec_change") {
    const artifactPath = artifactPaths[args.artifact];

    if (!artifactPath) {
      throw new Error(`Unknown artifact: ${args.artifact}`);
    }

    const text = await readRepoFile(artifactPath);

    return {
      content: [
        {
          type: "text",
          text,
        },
      ],
    };
  }

  if (name === "env_keys") {
    return {
      content: [
        {
          type: "text",
          text: [
            "Expected .env.local keys:",
            "- POCKETBASE_URL",
            "- POCKETBASE_ADMIN_EMAIL",
            "- POCKETBASE_ADMIN_PASSWORD",
          ].join("\n"),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
}

async function handle(message) {
  const { id, method, params } = message;

  if (method === "initialize") {
    result(id, {
      protocolVersion: params?.protocolVersion ?? "2024-11-05",
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: serverName,
        version: serverVersion,
      },
    });
    return;
  }

  if (method === "tools/list") {
    result(id, { tools });
    return;
  }

  if (method === "tools/call") {
    try {
      result(
        id,
        await callTool(params?.name, params?.arguments ?? {}),
      );
    } catch (toolError) {
      result(id, {
        isError: true,
        content: [
          {
            type: "text",
            text:
              toolError instanceof Error
                ? toolError.message
                : "Unknown tool error",
          },
        ],
      });
    }
    return;
  }

  if (id !== undefined) {
    error(id, -32601, `Method not found: ${method}`);
  }
}

const input = createInterface({
  input: process.stdin,
  crlfDelay: Infinity,
});

input.on("line", async (line) => {
  if (!line.trim()) {
    return;
  }

  try {
    await handle(JSON.parse(line));
  } catch (parseError) {
    error(
      null,
      -32700,
      parseError instanceof Error ? parseError.message : "Parse error",
    );
  }
});
