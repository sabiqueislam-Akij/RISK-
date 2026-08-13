"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import {
  STATUSES,
  formatDate,
  formatDateTime,
  riskScore,
  scoreTone,
} from "@/lib/risk";
import type { Risk } from "@/lib/risk";
import { Chip } from "@/components/chip";

const toneForStatus = (s: Risk["status"]) =>
  s === "Closed" ? "green" : s === "Escalated" ? "red" : s === "Mitigating" ? "amber" : "blue";

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] gap-3 border-b border-line/50 py-2.5 text-[13px] last:border-0">
      <div className="text-muted">{k}</div>
      <div className="font-medium">{v}</div>
    </div>
  );
}

export default function RiskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [risk, setRisk] = useState<Risk | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");
  const [by, setBy] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    fetch(`/api/risks/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Risk | null) => {
        if (data) {
          setRisk(data);
          setStatus(data.status);
        } else {
          setNotFound(true);
        }
      });
  }

  useEffect(load, [id]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/risks/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note, by }),
      });
      const data = await res.json();
      if (res.ok) {
        setRisk(data);
        setNote("");
        setBy("");
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  if (notFound) {
    return (
      <div className="rounded-xl border border-line bg-panel p-10 text-center">
        <p className="text-muted">Risk not found.</p>
        <Link href="/risks" className="mt-3 inline-block text-accent hover:underline">
          ← Back to register
        </Link>
      </div>
    );
  }

  if (!risk) {
    return (
      <div className="rounded-xl border border-line bg-panel p-10 text-center text-sm text-muted">
        Loading…
      </div>
    );
  }

  const score = riskScore(risk.likelihood, risk.impact);
  const tone = scoreTone(score);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/risks" className="text-[13px] text-accent hover:underline">
            ← Back to register
          </Link>
          <h1 className="mt-1 text-lg font-bold">
            {risk.projectId}/{risk.riskId}{" "}
            <span className="text-muted">— {risk.projectName}</span>
          </h1>
        </div>
        <Chip tone={toneForStatus(risk.status)}>{risk.status}</Chip>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div className="rounded-xl border border-line bg-panel p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <h2 className="mb-3 text-[13px] uppercase tracking-[0.8px] text-muted">
              Risk Details
            </h2>
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-bold"
              style={{
                background:
                  tone === "red"
                    ? "rgba(248,113,113,.15)"
                    : tone === "amber"
                      ? "rgba(251,191,36,.15)"
                      : "rgba(52,211,153,.15)",
                color: tone === "red" ? "var(--red)" : tone === "amber" ? "var(--amber)" : "var(--green)",
              }}
            >
              Risk score {score} / 25
            </div>
            <Row k="Description" v={risk.description} />
            <Row k="Category" v={<Chip>{risk.category}</Chip>} />
            <Row
              k="Likelihood × Impact"
              v={`${risk.likelihood} × ${risk.impact}`}
            />
            <Row k="Date raised" v={formatDate(risk.dateRaised)} />
            <Row k="Identifier" v={`${risk.identifierName} (${risk.identifierEmpId})`} />
            <Row k="Email" v={risk.email || "—"} />
            <Row k="Project zone / area" v={risk.projectZone} />
            <Row k="Risk Responsible" v={risk.riskResponsible} />
            <Row k="Risk Accountable" v={risk.riskAccountable} />
            <Row k="Mitigation plan" v={risk.mitigation} />
            <Row
              k="Attachment"
              v={
                risk.attachmentUrl ? (
                  <a
                    href={risk.attachmentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent hover:underline"
                  >
                    {risk.attachmentName || "Open link"}
                  </a>
                ) : (
                  risk.attachmentName || "—"
                )
              }
            />
            <Row k="Last updated" v={formatDateTime(risk.updatedAt)} />
          </div>

          <div className="rounded-xl border border-line bg-panel p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <h2 className="mb-3 text-[13px] uppercase tracking-[0.8px] text-muted">
              Update History
            </h2>
            {risk.updates.length === 0 ? (
              <p className="text-[13px] text-muted">No updates yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {[...risk.updates].reverse().map((u) => (
                  <div
                    key={u.id}
                    className="rounded-lg border border-line/60 bg-panel-2 p-3 text-[13px]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Chip tone={toneForStatus(u.status)}>{u.status}</Chip>
                      <span className="text-[11px] text-muted">
                        {formatDateTime(u.at)} · {u.by}
                      </span>
                    </div>
                    {u.note && <p className="mt-2 text-muted">{u.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="flex h-fit flex-col gap-4 rounded-xl border border-line bg-panel p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
        >
          <h2 className="text-[13px] uppercase tracking-[0.8px] text-muted">
            Update Status
          </h2>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[14px] text-ink outline-none focus:border-accent"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">Update note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="What has been done / next steps…"
              className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[14px] text-ink placeholder:text-muted outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[13px] font-medium text-ink">Updated by</label>
            <input
              value={by}
              onChange={(e) => setBy(e.target.value)}
              placeholder="Your name"
              className="w-full rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[14px] text-ink placeholder:text-muted outline-none focus:border-accent"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Update"}
          </button>
        </form>
      </div>
    </div>
  );
}
