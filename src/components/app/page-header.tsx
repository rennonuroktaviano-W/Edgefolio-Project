import type { ComponentType, ReactNode } from "react";

type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  meta?: ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: PageHeaderProps) {
  return (
    <header className="reveal">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.28em] text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base text-muted">
            {description}
          </p>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {meta ? <div className="mt-5">{meta}</div> : null}
    </header>
  );
}

type EmptyStateProps = {
  Icon?: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({
  Icon,
  title,
  description,
  action,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`grid place-items-center rounded-2xl border border-dashed border-hairline bg-night/40 text-center ${
        compact ? "p-8" : "p-10 sm:p-14"
      }`}
    >
      <div className="max-w-md">
        {Icon ? (
          <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-surface text-muted">
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
        <p className="mt-4 text-sm font-medium text-ink">{title}</p>
        <p className="mt-1.5 text-sm text-muted">{description}</p>
        {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}
