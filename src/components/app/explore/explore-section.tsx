import type { ComponentType, ReactNode } from "react";

const ICON_TONES = {
  accent: "text-accent",
  violet: "text-violet",
  info: "text-info",
} as const;

export function SectionHeading({
  Icon,
  title,
  description,
  action,
  iconTone = "accent",
}: {
  Icon?: ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
  iconTone?: keyof typeof ICON_TONES;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-start gap-3">
        {Icon ? (
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-hairline bg-surface ${ICON_TONES[iconTone]}`}
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
