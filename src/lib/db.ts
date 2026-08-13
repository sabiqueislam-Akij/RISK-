import type { Risk, RiskStatus, RiskUpdate } from "./risk";
import type { NewRiskInput } from "./store";
import {
  listRisks as listJson,
  getRisk as getJson,
  createRisk as createJson,
  addUpdate as updateJson,
  nextRiskId as nextJson,
  seedJson,
} from "./store";
import { seedRisks } from "./seed";

const usePg = !!process.env.POSTGRES_URL;

let seeded = false;

async function pg() {
  return await import("./postgres-store");
}

async function ensureSeeded() {
  if (seeded) return;
  if (usePg) {
    const pgStore = await pg();
    const rows = await pgStore.listRisksPg();
    if (rows.length === 0) await pgStore.seedPg(seedRisks);
  } else {
    const rows = await listJson();
    if (rows.length === 0) await seedJson(seedRisks);
  }
  seeded = true;
}

export const db = {
  list: async (): Promise<Risk[]> => {
    await ensureSeeded();
    return usePg ? (await pg()).listRisksPg() : listJson();
  },
  get: async (id: string): Promise<Risk | undefined> => {
    await ensureSeeded();
    return usePg ? (await pg()).getRiskPg(id) : getJson(id);
  },
  create: async (input: NewRiskInput): Promise<Risk> =>
    usePg ? (await pg()).createRiskPg(input) : createJson(input),
  addUpdate: async (
    id: string,
    update: Omit<RiskUpdate, "id" | "at"> & { status: RiskStatus }
  ): Promise<Risk | undefined> =>
    usePg ? (await pg()).addUpdatePg(id, update) : updateJson(id, update),
  nextRiskId: async (): Promise<string> =>
    usePg ? (await pg()).nextRiskIdPg() : nextJson(),
};
