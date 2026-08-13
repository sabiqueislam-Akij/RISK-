export type Tone = "green" | "amber" | "red" | "blue" | "violet" | "default";

const tones: Record<Tone, string> = {
  green: "bg-green/15 text-green",
  amber: "bg-amber/15 text-amber",
  red: "bg-red/15 text-red",
  blue: "bg-accent/15 text-accent",
  violet: "bg-violet/15 text-violet",
  default: "bg-panel-2 text-muted",
};

export function Chip({
  tone = "default",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
