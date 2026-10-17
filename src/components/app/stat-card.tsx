import type { ReactNode } from "react";

export type StatTone = "neutral" | "positive" | "negative";

const VALUE_TONES: Record<StatTone, string> = {
  neutral: "text-ink",
  positive: "text-positive",
  negative: "text-negative",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "neutral",
  placeholder = false,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: StatTone;
  placeholder?: boolean;
}) {
  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-4 sm:p-5">
      <p className="text-xs text-muted">{label}</p>
      <p
        className={`mt-2 text-2xl font-semibold tracking-tight sm:text-3xl ${
          placeholder ? "text-faint" : VALUE_TONES[tone]
        }`}
      >
        {value}
      </p>
      {hint ? <p className="mt-2 text-xs text-faint">{hint}</p> : null}
    </div>
  );
}
