import type { ReactNode } from "react";

export type BadgeTone =
  | "accent"
  | "positive"
  | "negative"
  | "warning"
  | "info"
  | "muted";

const TONES: Record<BadgeTone, string> = {
  accent: "border-accent/40 bg-accent/10 text-accent",
  positive: "border-positive/40 bg-positive/10 text-positive",
  negative: "border-negative/40 bg-negative/10 text-negative",
  warning: "border-warning/40 bg-warning/10 text-warning",
  info: "border-info/40 bg-info/10 text-info",
  muted: "border-hairline bg-surface text-muted",
};

export function Badge({
  tone = "muted",
  children,
  className = "",
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${TONES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
