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
import {
  listRisksPg,
  getRiskPg,
  createRiskPg,
  addUpdatePg,
  nextRiskIdPg,
  seedPg,
} from "./postgres-store";
import { seedRisks } from "./seed";

const usePg = !!process.env.POSTGRES_URL;

let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  const rows = usePg ? await listRisksPg() : await listJson();
  if (rows.length === 0) {
    if (usePg) {
      await seedPg(seedRisks);
    } else {
      await seedJson(seedRisks);
    }
  }
  seeded = true;
}

export const db = {
  list: async (): Promise<Risk[]> => {
    await ensureSeeded();
    return usePg ? listRisksPg() : listJson();
  },
  get: async (id: string): Promise<Risk | undefined> => {
    await ensureSeeded();
    return usePg ? getRiskPg(id) : getJson(id);
  },
  create: async (input: NewRiskInput): Promise<Risk> =>
    usePg ? createRiskPg(input) : createJson(input),
  addUpdate: async (
    id: string,
    update: Omit<RiskUpdate, "id" | "at"> & { status: RiskStatus }
  ): Promise<Risk | undefined> =>
    usePg ? addUpdatePg(id, update) : updateJson(id, update),
  nextRiskId: async (): Promise<string> =>
    usePg ? nextRiskIdPg() : nextJson(),
};
