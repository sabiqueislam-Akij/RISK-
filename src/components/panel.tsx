export function Panel({
  title,
  right,
  children,
  className = "",
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-line bg-panel p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)] ${className}`}
    >
      {title && (
        <h2 className="mb-3 flex items-center justify-between text-[13px] uppercase tracking-[0.8px] text-muted">
          {title}
          {right}
        </h2>
      )}
      {children}
    </section>
  );
}

export function Kpi({
  label,
  value,
  delta,
  tone,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  tone?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-panel p-4 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <div
        className={`absolute inset-y-0 left-0 w-1 ${tone ?? "bg-accent"}`}
        style={tone ? { background: tone } : undefined}
      />
      <div className="text-xs uppercase tracking-[0.6px] text-muted">
        {label}
      </div>
      <div className="mt-1.5 text-[26px] font-bold leading-none">{value}</div>
      {delta && <div className="mt-1.5 text-xs text-muted">{delta}</div>}
    </div>
  );
}
