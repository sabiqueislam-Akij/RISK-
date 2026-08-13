import {
  IMPACTS,
  LIKELIHOODS,
  RISK_CATEGORIES,
  STATUSES,
} from "./risk";
import type { NewRiskInput } from "./store";

export function validateRisk(body: unknown): { ok: true; data: NewRiskInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid body" };
  }
  const b = body as Record<string, unknown>;

  const str = (v: unknown): string =>
    typeof v === "string" ? v.trim() : "";

  const required: Array<[keyof NewRiskInput, string]> = [
    ["projectId", "Project ID"],
    ["riskId", "Risk ID"],
    ["dateRaised", "Date of Raising Risk"],
    ["projectName", "Project Name"],
    ["projectZone", "Project Zone / Area"],
    ["identifierName", "Risk Identifier Name"],
    ["identifierEmpId", "Risk Identifier ID / Employee ID"],
    ["description", "Description of Risk"],
    ["riskResponsible", "Risk Responsible"],
    ["riskAccountable", "Risk Accountable"],
    ["mitigation", "Mitigation Plan / Solution Details"],
  ];

  for (const [key, label] of required) {
    if (!str(b[key])) {
      return { ok: false, error: `${label} is required` };
    }
  }

  if (!RISK_CATEGORIES.includes(b.category as never)) {
    return { ok: false, error: "Invalid Risk Category" };
  }
  if (!LIKELIHOODS.includes(b.likelihood as never)) {
    return { ok: false, error: "Invalid Likelihood" };
  }
  if (!IMPACTS.includes(b.impact as never)) {
    return { ok: false, error: "Invalid Impact" };
  }
  if (!STATUSES.includes(b.status as never)) {
    return { ok: false, error: "Invalid Status" };
  }

  return {
    ok: true,
    data: {
      projectId: str(b.projectId),
      riskId: str(b.riskId),
      email: str(b.email),
      dateRaised: str(b.dateRaised),
      projectName: str(b.projectName),
      projectZone: str(b.projectZone),
      identifierName: str(b.identifierName),
      identifierEmpId: str(b.identifierEmpId),
      category: b.category as NewRiskInput["category"],
      description: str(b.description),
      likelihood: b.likelihood as NewRiskInput["likelihood"],
      impact: b.impact as NewRiskInput["impact"],
      riskResponsible: str(b.riskResponsible),
      riskAccountable: str(b.riskAccountable),
      mitigation: str(b.mitigation),
      status: b.status as NewRiskInput["status"],
      attachmentName: str(b.attachmentName),
      attachmentUrl: str(b.attachmentUrl),
    },
  };
}
