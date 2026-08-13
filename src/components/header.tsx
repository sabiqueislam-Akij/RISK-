import Link from "next/link";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/risks", label: "Risk Register" },
];

export function Header() {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3.5">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-accent to-violet text-lg font-extrabold text-bg">
          AR
        </div>
        <div>
          <h1 className="text-[20px] font-bold leading-tight">
            Risk & Issue Register
          </h1>
          <p className="text-[13px] text-muted">
            Akij Resource — Operations · Project Control
          </p>
        </div>
      </div>
      <nav className="flex items-center gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg border border-line bg-panel-2 px-3.5 py-2 text-[13px] font-medium text-ink transition-colors hover:border-accent/60 hover:text-accent"
          >
            {l.label}
          </Link>
        ))}
        <Link
          href="/risks/new"
          className="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-bg transition-opacity hover:opacity-90"
        >
          + New Risk
        </Link>
      </nav>
    </header>
  );
}
