import { promises as fs } from "fs";
import path from "path";
import type { Risk, RiskUpdate, RiskStatus } from "./risk";

export interface NewRiskInput {
  projectId: string;
  riskId: string;
  email: string;
  dateRaised: string;
  projectName: string;
  projectZone: string;
  identifierName: string;
  identifierEmpId: string;
  category: Risk["category"];
  description: string;
  likelihood: Risk["likelihood"];
  impact: Risk["impact"];
  riskResponsible: string;
  riskAccountable: string;
  mitigation: string;
  status: RiskStatus;
  attachmentName: string;
  attachmentUrl: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "risks.json");

export async function ensureDataFile() {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

async function readAll(): Promise<Risk[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, "utf-8");
  return JSON.parse(raw || "[]") as Risk[];
}

export async function writeAll(risks: Risk[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(risks, null, 2), "utf-8");
}

export async function seedJson(risks: Risk[]) {
  await writeAll(risks);
}

export async function listRisks(): Promise<Risk[]> {
  const risks = await readAll();
  return risks.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getRisk(id: string): Promise<Risk | undefined> {
  const risks = await readAll();
  return risks.find((r) => r.id === id);
}

export async function createRisk(input: NewRiskInput): Promise<Risk> {
  const now = new Date().toISOString();
  const risk: Risk = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `r_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    createdAt: now,
    updatedAt: now,
    updates: [],
  };
  const risks = await readAll();
  risks.push(risk);
  await writeAll(risks);
  return risk;
}

export async function addUpdate(
  id: string,
  update: Omit<RiskUpdate, "id" | "at"> & { status: RiskStatus }
): Promise<Risk | undefined> {
  const risks = await readAll();
  const idx = risks.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  const risk = risks[idx];
  const entry: RiskUpdate = {
    ...update,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `u_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    at: new Date().toISOString(),
  };
  risk.updates.push(entry);
  risk.status = update.status;
  risk.updatedAt = entry.at;
  risks[idx] = risk;
  await writeAll(risks);
  return risk;
}

export async function nextRiskId(): Promise<string> {
  const risks = await readAll();
  const nums = risks
    .map((r) => parseInt(r.riskId, 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 1000;
  return String(max + 1);
}
