export const RISK_CATEGORIES = [
  "Technical",
  "Safety",
  "Quality",
  "Resource",
  "Schedule",
  "Commercial",
  "Design",
  "MEP",
  "Environmental",
  "Other",
] as const;

export const LIKELIHOODS = [
  "Very Low",
  "Low",
  "Medium",
  "High",
  "Very High",
] as const;

export const IMPACTS = [
  "Very Low",
  "Low",
  "Medium",
  "High",
  "Very High",
] as const;

export const STATUSES = ["Open", "Mitigating", "Escalated", "Closed"] as const;

export type RiskCategory = (typeof RISK_CATEGORIES)[number];
export type Likelihood = (typeof LIKELIHOODS)[number];
export type Impact = (typeof IMPACTS)[number];
export type RiskStatus = (typeof STATUSES)[number];

export interface RiskUpdate {
  id: string;
  at: string;
  by: string;
  status: RiskStatus;
  note: string;
}

export interface Risk {
  id: string;
  projectId: string;
  riskId: string;
  email: string;
  dateRaised: string;
  projectName: string;
  projectZone: string;
  identifierName: string;
  identifierEmpId: string;
  category: RiskCategory;
  description: string;
  likelihood: Likelihood;
  impact: Impact;
  riskResponsible: string;
  riskAccountable: string;
  mitigation: string;
  status: RiskStatus;
  attachmentName: string;
  attachmentUrl: string;
  createdAt: string;
  updatedAt: string;
  updates: RiskUpdate[];
}

export const LEVEL_WEIGHT: Record<string, number> = {
  "Very Low": 1,
  Low: 2,
  Medium: 3,
  High: 4,
  "Very High": 5,
};

export function riskScore(likelihood: Likelihood, impact: Impact): number {
  return LEVEL_WEIGHT[likelihood] * LEVEL_WEIGHT[impact];
}

export function scoreTone(score: number): "green" | "amber" | "red" {
  if (score >= 12) return "red";
  if (score >= 6) return "amber";
  return "green";
}

export function statusTone(status: RiskStatus): "green" | "amber" | "red" | "blue" {
  switch (status) {
    case "Open":
      return "blue";
    case "Mitigating":
      return "amber";
    case "Escalated":
      return "red";
    case "Closed":
      return "green";
  }
}

export function formatDate(d: string): string {
  if (!d) return "—";
  const date = new Date(d.length === 10 ? `${d}T00:00:00` : d);
  if (isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
