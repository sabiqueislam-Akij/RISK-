import Link from "next/link";
import { db } from "@/lib/db";
import {
  IMPACTS,
  LIKELIHOODS,
  RISK_CATEGORIES,
  formatDate,
  riskScore,
  scoreTone,
} from "@/lib/risk";
import { Chip } from "@/components/chip";
import { Kpi, Panel } from "@/components/panel";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const risks = await db.list();

  const open = risks.filter((r) => r.status !== "Closed");
  const closed = risks.length - open.length;
  const escalated = risks.filter((r) => r.status === "Escalated").length;
  const highRisk = risks.filter(
    (r) => riskScore(r.likelihood, r.impact) >= 12 && r.status !== "Closed"
  ).length;

  const byCategory = RISK_CATEGORIES.map((c) => ({
    name: c,
    count: risks.filter((r) => r.category === c).length,
  }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const byProject = new Map<string, number>();
  for (const r of risks) {
    byProject.set(r.projectName, (byProject.get(r.projectName) ?? 0) + 1);
  }
  const projectRows = [...byProject.entries()].sort((a, b) => b[1] - a[1]);

  const maxCat = byCategory.length ? byCategory[0].count : 1;

  const heatmap = LIKELIHOODS.map((lik) =>
    IMPACTS.map((imp) => ({
      lik,
      imp,
      count: risks.filter(
        (r) => r.likelihood === lik && r.impact === imp
      ).length,
    }))
  );

  const recent = risks.slice(0, 6);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Kpi label="Total Risks" value={risks.length} delta={`${closed} closed`} tone="var(--accent)" />
        <Kpi label="Open / Active" value={open.length} delta="not yet closed" tone="var(--violet)" />
        <Kpi label="Escalated" value={escalated} delta="needs management attention" tone="var(--red)" />
        <Kpi label="High Risk (open)" value={highRisk} delta="score ≥ 12" tone="var(--amber)" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Likelihood × Impact Heat Map">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th className="px-1 py-1 text-left text-[11px] uppercase tracking-wider text-muted">
                    Likelihood ↓
                  </th>
                  {IMPACTS.map((imp) => (
                    <th
                      key={imp}
                      className="px-1 py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted"
                    >
                      {imp}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmap.map((row) => (
                  <tr key={row[0].lik}>
                    <td className="pr-2 py-1 text-[11px] text-muted">
                      {row[0].lik}
                    </td>
                    {row.map((cell) => {
                      const score = riskScore(cell.lik, cell.imp);
                      const tone = scoreTone(score);
                      const active = cell.count > 0;
                      return (
                        <td key={cell.imp} className="p-0.5">
                          <div
                            className={`rounded-md py-2 text-center text-sm font-bold ${
                              tone === "red"
                                ? active ? "bg-red/40 text-red" : "bg-red/10 text-red/40"
                                : tone === "amber"
                                  ? active ? "bg-amber/35 text-amber" : "bg-amber/10 text-amber/40"
                                  : active ? "bg-green/35 text-green" : "bg-green/10 text-green/40"
                            }`}
                          >
                            {cell.count}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-green/40" /> Low (≤5)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-amber/40" /> Medium (6–11)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded bg-red/40" /> High (≥12)
            </span>
          </div>
        </Panel>

        <Panel title="Risks by Category">
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted">No risks recorded yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {byCategory.map((c) => (
                <div
                  key={c.name}
                  className="grid grid-cols-[110px_1fr_40px] items-center gap-3 text-[13px]"
                >
                  <span className="text-muted">{c.name}</span>
                  <div className="h-2.5 overflow-hidden rounded bg-bg-2">
                    <div
                      className="h-full rounded bg-gradient-to-r from-accent to-violet transition-all"
                      style={{ width: `${(c.count / maxCat) * 100}%` }}
                    />
                  </div>
                  <span className="text-right font-semibold">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <Panel title="Open Risks by Project">
          {projectRows.length === 0 ? (
            <p className="text-sm text-muted">No projects yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {projectRows.map(([name, count]) => (
                <div
                  key={name}
                  className="grid grid-cols-[1fr_70px] items-center gap-3 text-[13px]"
                >
                  <span className="truncate text-ink">{name}</span>
                  <div className="flex items-center justify-end gap-2">
                    <div className="h-2.5 w-16 overflow-hidden rounded bg-bg-2">
                      <div
                        className="h-full rounded bg-accent"
                        style={{
                          width: `${(count / Math.max(...projectRows.map((p) => p[1]))) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="w-5 text-right font-semibold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>

      <Panel
        title="Recent Risks"
        right={
          <Link href="/risks" className="text-[12px] normal-case text-accent hover:underline">
            View all →
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wider text-muted">Risk ID</th>
                <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wider text-muted">Project</th>
                <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wider text-muted">Category</th>
                <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wider text-muted">Description</th>
                <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wider text-muted">Raised</th>
                <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wider text-muted">Score</th>
                <th className="px-2 py-2 text-left text-[11px] uppercase tracking-wider text-muted">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => {
                const score = riskScore(r.likelihood, r.impact);
                return (
                  <tr key={r.id} className="hover:bg-accent/5">
                    <td className="px-2 py-2.5 font-mono text-[12px] text-accent">
                      <Link href={`/risks/${r.id}`} className="hover:underline">
                        {r.riskId}
                      </Link>
                    </td>
                    <td className="px-2 py-2.5">
                      <div className="font-medium">{r.projectName}</div>
                      <div className="text-[11px] text-muted">{r.projectZone}</div>
                    </td>
                    <td className="px-2 py-2.5"><Chip>{r.category}</Chip></td>
                    <td className="max-w-[260px] truncate px-2 py-2.5 text-muted">{r.description}</td>
                    <td className="px-2 py-2.5 text-muted">{formatDate(r.dateRaised)}</td>
                    <td className="px-2 py-2.5 font-mono text-sm font-bold" style={{ color: scoreTone(score) === "red" ? "var(--red)" : scoreTone(score) === "amber" ? "var(--amber)" : "var(--green)" }}>
                      {score}
                    </td>
                    <td className="px-2 py-2.5">
                      <Chip tone={r.status === "Closed" ? "green" : r.status === "Escalated" ? "red" : r.status === "Mitigating" ? "amber" : "blue"}>
                        {r.status}
                      </Chip>
                    </td>
                  </tr>
                );
              })}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-2 py-6 text-center text-muted">
                    No risks recorded yet.{" "}
                    <Link href="/risks/new" className="text-accent hover:underline">
                      Record the first one →
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
