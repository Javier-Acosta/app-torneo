import { getRequiredPocketBaseEnv } from "./env.mjs";

export class PocketBaseAdminClient {
  constructor() {
    this.config = getRequiredPocketBaseEnv();
    this.token = undefined;
  }

  async auth() {
    const response = await this.request("/api/collections/_superusers/auth-with-password", {
      method: "POST",
      body: {
        identity: this.config.email,
        password: this.config.password,
      },
      authenticated: false,
    });

    this.token = response.token;
    if (!this.token) {
      throw new Error("PocketBase auth succeeded without returning a token.");
    }
  }

  async request(path, options = {}) {
    const headers = {
      "content-type": "application/json",
      ...(options.headers ?? {}),
    };

    if (options.authenticated !== false) {
      if (!this.token) await this.auth();
      headers.authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.config.url}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const detail = await safeJson(response);
      if (path.includes("_superusers/auth-with-password") && response.status === 400) {
        throw new Error(
          "PocketBase superuser authentication failed. Check POCKETBASE_SUPERUSER_EMAIL/POCKETBASE_SUPERUSER_PASSWORD or the POCKETBASE_ADMIN_* aliases in .env.local.",
        );
      }
      throw new Error(
        `PocketBase ${options.method ?? "GET"} ${path} failed with ${response.status}: ${JSON.stringify(detail)}`,
      );
    }

    return safeJson(response);
  }

  async findCollection(name) {
    try {
      return await this.request(`/api/collections/${encodeURIComponent(name)}`);
    } catch (error) {
      if (String(error.message).includes("404")) return undefined;
      throw error;
    }
  }

  async upsertCollection(definition) {
    const resolvedDefinition = await this.resolveRelationCollections(definition);
    const existing = await this.findCollection(resolvedDefinition.name);

    if (!existing) {
      await this.request("/api/collections", {
        method: "POST",
        body: resolvedDefinition,
      });
      return "created";
    }

    await this.request(`/api/collections/${existing.id}`, {
      method: "PATCH",
      body: resolvedDefinition,
    });
    return "updated";
  }

  async resolveRelationCollections(definition) {
    const fields = [];

    for (const field of definition.fields ?? []) {
      if (field.type !== "relation") {
        fields.push(field);
        continue;
      }

      const related = await this.findCollection(field.collectionId);
      if (!related) {
        throw new Error(
          `Cannot create ${definition.name}.${field.name}: related collection ${field.collectionId} does not exist yet.`,
        );
      }

      fields.push({
        ...field,
        collectionId: related.id,
      });
    }

    return {
      ...definition,
      fields,
    };
  }

  async createRecord(collection, data) {
    return this.request(`/api/collections/${collection}/records`, {
      method: "POST",
      body: data,
    });
  }

  async getFirstRecord(collection, filter) {
    const params = new URLSearchParams({
      page: "1",
      perPage: "1",
      filter,
    });
    const result = await this.request(`/api/collections/${collection}/records?${params}`);
    return result.items?.[0];
  }
}

async function safeJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}
