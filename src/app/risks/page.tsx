"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  IMPACTS,
  LIKELIHOODS,
  RISK_CATEGORIES,
  STATUSES,
  formatDate,
  riskScore,
  scoreTone,
} from "@/lib/risk";
import type { Risk } from "@/lib/risk";
import { Chip } from "@/components/chip";

const toneForStatus = (s: Risk["status"]) =>
  s === "Closed" ? "green" : s === "Escalated" ? "red" : s === "Mitigating" ? "amber" : "blue";

export default function RegisterPage() {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");
  const [project, setProject] = useState("All");
  const [lik, setLik] = useState("All");
  const [imp, setImp] = useState("All");

  useEffect(() => {
    fetch("/api/risks")
      .then((r) => r.json())
      .then((data: Risk[]) => {
        setRisks(data);
        setLoading(false);
      });
  }, []);

  const projects = useMemo(
    () => [...new Set(risks.map((r) => r.projectName))].sort(),
    [risks]
  );

  const filtered = useMemo(() => {
    return risks.filter((r) => {
      if (q && !(r.description + r.projectName + r.riskId + r.projectZone).toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "All" && r.category !== cat) return false;
      if (status !== "All" && r.status !== status) return false;
      if (project !== "All" && r.projectName !== project) return false;
      if (lik !== "All" && r.likelihood !== lik) return false;
      if (imp !== "All" && r.impact !== imp) return false;
      return true;
    });
  }, [risks, q, cat, status, project, lik, imp]);

  const selectCls =
    "rounded-lg border border-line bg-panel-2 px-3 py-2 text-[13px] text-ink outline-none focus:border-accent";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-bold">Risk Register</h1>
        <Link
          href="/risks/new"
          className="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90"
        >
          + New Risk
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search description, project, ID…"
          className="w-full min-w-[220px] flex-1 rounded-lg border border-line bg-panel-2 px-3 py-2 text-[13px] text-ink placeholder:text-muted outline-none focus:border-accent sm:w-auto"
        />
        <select className={selectCls} value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="All">All categories</option>
          {RISK_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select className={selectCls} value={project} onChange={(e) => setProject(e.target.value)}>
          <option value="All">All projects</option>
          {projects.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select className={selectCls} value={lik} onChange={(e) => setLik(e.target.value)}>
          <option value="All">Any likelihood</option>
          {LIKELIHOODS.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
        <select className={selectCls} value={imp} onChange={(e) => setImp(e.target.value)}>
          <option value="All">Any impact</option>
          {IMPACTS.map((i) => (
            <option key={i} value={i}>{i}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-line bg-panel shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted">Loading register…</div>
        ) : (
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr className="bg-panel-2">
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted">Risk ID</th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted">Project</th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted">Category</th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted">Description</th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted">L × I</th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted">Score</th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted">Responsible</th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted">Raised</th>
                <th className="px-3 py-2.5 text-left text-[11px] uppercase tracking-wider text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const score = riskScore(r.likelihood, r.impact);
                const tone = scoreTone(score);
                return (
                  <tr key={r.id} className="border-t border-line/60 hover:bg-accent/5">
                    <td className="px-3 py-3 font-mono text-[12px] text-accent">
                      <Link href={`/risks/${r.id}`} className="hover:underline">
                        {r.projectId}/{r.riskId}
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{r.projectName}</div>
                      <div className="text-[11px] text-muted">{r.projectZone}</div>
                    </td>
                    <td className="px-3 py-3"><Chip>{r.category}</Chip></td>
                    <td className="max-w-[280px] px-3 py-3">
                      <div className="line-clamp-2 text-muted">{r.description}</div>
                      <div className="mt-0.5 text-[11px] text-muted/70">{r.identifierName}</div>
                    </td>
                    <td className="px-3 py-3 text-[11px] text-muted">
                      {r.likelihood}
                      <br />× {r.impact}
                    </td>
                    <td className="px-3 py-3 font-mono text-sm font-bold"
                      style={{ color: tone === "red" ? "var(--red)" : tone === "amber" ? "var(--amber)" : "var(--green)" }}>
                      {score}
                    </td>
                    <td className="px-3 py-3 text-muted">{r.riskResponsible}</td>
                    <td className="px-3 py-3 text-muted">{formatDate(r.dateRaised)}</td>
                    <td className="px-3 py-3"><Chip tone={toneForStatus(r.status)}>{r.status}</Chip></td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-3 py-8 text-center text-muted">
                    No risks match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
