import { createClient } from "@vercel/postgres";
import type { Risk, RiskStatus, RiskUpdate } from "./risk";
import type { NewRiskInput } from "./store";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS risks (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL
)
`;

async function withClient<T>(
  fn: (c: ReturnType<typeof createClient>) => Promise<T>
): Promise<T> {
  const c = createClient({
    connectionString:
      process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? "",
  });
  try {
    await c.connect();
    return await fn(c);
  } finally {
    try {
      await c.end();
    } catch {
      // ignore
    }
  }
}

export async function listRisksPg(): Promise<Risk[]> {
  return withClient(async (c) => {
    await c.query(SCHEMA);
    const { rows } = await c.query<{ data: Risk }>(
      "SELECT data FROM risks ORDER BY data->>'updatedAt' DESC"
    );
    return rows.map((r) => r.data);
  });
}

export async function getRiskPg(id: string): Promise<Risk | undefined> {
  return withClient(async (c) => {
    await c.query(SCHEMA);
    const { rows } = await c.query<{ data: Risk }>(
      "SELECT data FROM risks WHERE id = $1",
      [id]
    );
    return rows[0]?.data;
  });
}

export async function createRiskPg(input: NewRiskInput): Promise<Risk> {
  return withClient(async (c) => {
    await c.query(SCHEMA);
    const now = new Date().toISOString();
    const risk: Risk = {
      ...input,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      updates: [],
    };
    await c.query("INSERT INTO risks (id, data) VALUES ($1, $2)", [
      risk.id,
      JSON.stringify(risk),
    ]);
    return risk;
  });
}

export async function addUpdatePg(
  id: string,
  update: Omit<RiskUpdate, "id" | "at"> & { status: RiskStatus }
): Promise<Risk | undefined> {
  return withClient(async (c) => {
    await c.query(SCHEMA);
    const { rows } = await c.query<{ data: Risk }>(
      "SELECT data FROM risks WHERE id = $1",
      [id]
    );
    const existing = rows[0]?.data;
    if (!existing) return undefined;
    const entry: RiskUpdate = {
      ...update,
      id: crypto.randomUUID(),
      at: new Date().toISOString(),
    };
    const risk: Risk = {
      ...existing,
      updates: [...existing.updates, entry],
      status: update.status,
      updatedAt: entry.at,
    };
    await c.query("UPDATE risks SET data = $2 WHERE id = $1", [
      id,
      JSON.stringify(risk),
    ]);
    return risk;
  });
}

export async function seedPg(risks: Risk[]) {
  return withClient(async (c) => {
    await c.query(SCHEMA);
    for (const risk of risks) {
      await c.query(
        "INSERT INTO risks (id, data) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING",
        [risk.id, JSON.stringify(risk)]
      );
    }
  });
}

export async function nextRiskIdPg(): Promise<string> {
  return withClient(async (c) => {
    await c.query(SCHEMA);
    const { rows } = await c.query<{ riskid: string }>(
      "SELECT data->>'riskId' AS riskid FROM risks"
    );
    const nums = rows
      .map((r) => parseInt(r.riskid, 10))
      .filter((n) => !isNaN(n));
    const max = nums.length ? Math.max(...nums) : 1000;
    return String(max + 1);
  });
}
