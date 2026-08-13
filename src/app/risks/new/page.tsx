"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IMPACTS,
  LIKELIHOODS,
  RISK_CATEGORIES,
  STATUSES,
} from "@/lib/risk";

const field = "w-full rounded-lg border border-line bg-panel-2 px-3 py-2.5 text-[14px] text-ink placeholder:text-muted outline-none focus:border-accent";
const label = "mb-1.5 block text-[13px] font-medium text-ink";
const req = <span className="text-red"> *</span>;

function Section({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <fieldset className="rounded-xl border border-line bg-panel p-5 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <legend className="px-2 text-[13px] font-semibold uppercase tracking-wider text-accent">
        {title}
      </legend>
      <div className="flex flex-col gap-4">{children}</div>
    </fieldset>
  );
}

export default function NewRiskPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [nextId, setNextId] = useState("");
  const [form, setForm] = useState({
    projectId: "",
    riskId: "",
    dateRaised: new Date().toISOString().slice(0, 10),
    projectName: "",
    projectZone: "",
    identifierName: "",
    identifierEmpId: "",
    category: "Technical",
    description: "",
    likelihood: "Medium",
    impact: "Medium",
    riskResponsible: "",
    riskAccountable: "",
    mitigation: "",
    status: "Open",
    attachmentName: "",
    attachmentUrl: "",
  });

  useEffect(() => {
    fetch("/api/risks")
      .then((r) => r.json())
      .then((data: { riskId: string }[]) => {
        const nums = data
          .map((d) => parseInt(d.riskId, 10))
          .filter((n) => !isNaN(n));
        setNextId(String((nums.length ? Math.max(...nums) : 1000) + 1));
      });
  }, []);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/risks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email, riskId: form.riskId || nextId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save risk.");
        setSubmitting(false);
        return;
      }
      router.push(`/risks/${data.id}`);
    } catch {
      setError("Network error while saving.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold">New Risk / Issue</h1>
        <Link href="/risks" className="text-[13px] text-accent hover:underline">
          ← Back to register
        </Link>
      </div>

      <p className="rounded-lg border border-line bg-panel-2 px-4 py-3 text-[13px] text-muted">
        This form is for identifying and sharing intra-departmental risks, issues and
        changes related to projects.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="rounded-lg border border-red/40 bg-red/10 px-4 py-3 text-[13px] text-red">
            {error}
          </div>
        )}

        <Section title="Submission">
          <div>
            <label className={label}>
              Email
              <span className="text-red"> *</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@akijresource.com"
              className={field}
            />
            <p className="mt-1 text-[11px] text-muted">
              Recorded with the submission and used for follow-up.
            </p>
          </div>
        </Section>

        <Section title="Project & Identification">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Project ID{req}</label>
              <input value={form.projectId} onChange={set("projectId")} required placeholder="e.g. AML_01" className={field} />
            </div>
            <div>
              <label className={label}>
                Risk ID
                <span className="text-[11px] font-normal text-muted"> (auto-suggested)</span>
              </label>
              <input value={form.riskId} onChange={set("riskId")} placeholder={nextId || "Auto"} className={field} />
            </div>
            <div>
              <label className={label}>Date of Raising Risk{req}</label>
              <input type="date" value={form.dateRaised} onChange={set("dateRaised")} required className={field} />
            </div>
            <div>
              <label className={label}>Project Name{req}</label>
              <input value={form.projectName} onChange={set("projectName")} required placeholder="e.g. Akij Mediplex" className={field} />
            </div>
            <div>
              <label className={label}>Project Zone / Area{req}</label>
              <input value={form.projectZone} onChange={set("projectZone")} required placeholder="e.g. Mirpur-10" className={field} />
            </div>
            <div>
              <label className={label}>Risk Identifier Name{req}</label>
              <input value={form.identifierName} onChange={set("identifierName")} required placeholder="Your full name" className={field} />
            </div>
            <div>
              <label className={label}>Risk Identifier ID / Employee ID{req}</label>
              <input value={form.identifierEmpId} onChange={set("identifierEmpId")} required placeholder="e.g. 559464" className={field} />
            </div>
          </div>
        </Section>

        <Section title="Risk Assessment">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={label}>Risk Category{req}</label>
              <select value={form.category} onChange={set("category")} className={field}>
                {RISK_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Likelihood of Occurrence{req}</label>
              <select value={form.likelihood} onChange={set("likelihood")} className={field}>
                {LIKELIHOODS.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Impact if Occurs{req}</label>
              <select value={form.impact} onChange={set("impact")} className={field}>
                {IMPACTS.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Description of Risk{req}</label>
            <textarea value={form.description} onChange={set("description")} required rows={3} placeholder="Details of the requested issue / risk / change" className={field} />
          </div>
        </Section>

        <Section title="Accountability & Response">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>Risk Responsible{req}</label>
              <input value={form.riskResponsible} onChange={set("riskResponsible")} required placeholder="Who executes the mitigation" className={field} />
            </div>
            <div>
              <label className={label}>Risk Accountable{req}</label>
              <input value={form.riskAccountable} onChange={set("riskAccountable")} required placeholder="Who is accountable" className={field} />
            </div>
          </div>
          <div>
            <label className={label}>Mitigation Plan / Solution Details{req}</label>
            <textarea value={form.mitigation} onChange={set("mitigation")} required rows={3} placeholder="Suggestions for resolving issue / mitigating risk / change management" className={field} />
          </div>
          <div>
            <label className={label}>Current Status{req}</label>
            <select value={form.status} onChange={set("status")} className={field}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </Section>

        <Section title="Attachment (optional)">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={label}>File name</label>
              <input value={form.attachmentName} onChange={set("attachmentName")} placeholder="e.g. site-photo.jpg" className={field} />
            </div>
            <div>
              <label className={label}>Link (Google Drive / shared path)</label>
              <input value={form.attachmentUrl} onChange={set("attachmentUrl")} placeholder="https://…" className={field} />
            </div>
          </div>
        </Section>

        <div className="flex items-center justify-end gap-3">
          <Link href="/risks" className="rounded-lg border border-line bg-panel-2 px-4 py-2.5 text-[13px] font-medium text-ink hover:border-accent/60 hover:text-accent">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-accent px-5 py-2.5 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Submit Risk"}
          </button>
        </div>
      </form>
    </div>
  );
}
