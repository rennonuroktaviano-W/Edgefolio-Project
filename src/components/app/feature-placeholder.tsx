import type { ComponentType, ReactNode } from "react";

type FeaturePlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  points: readonly string[];
  Icon?: ComponentType<{ className?: string }>;
  children?: ReactNode;
};

// Honest "not built yet" state for areas that need backend work we have not
// shipped. It never renders fabricated numbers, users, or results.
export function FeaturePlaceholder({
  eyebrow,
  title,
  description,
  points,
  Icon,
  children,
}: FeaturePlaceholderProps) {
  return (
    <div className="reveal">
      <header>
        <p className="text-xs font-semibold tracking-[0.28em] text-accent">
          {eyebrow}
        </p>
        <h1 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-muted">
          {description}
        </p>
      </header>

      <section className="soft-frame mt-8 rounded-2xl bg-surface-raised p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {Icon ? (
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-hairline bg-surface text-accent">
              <Icon className="h-5 w-5" />
            </span>
          ) : null}

          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-xs font-medium text-muted">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-warning"
              />
              In development
            </span>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-ink">
              This area is being built
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              It is not available yet, so there is nothing to show here. No
              sample data is displayed while this feature is in progress.
            </p>
          </div>
        </div>

        {points.length > 0 ? (
          <div className="mt-7 border-t border-hairline pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
              Planned capabilities
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2.5 text-sm text-muted"
                >
                  <span
                    aria-hidden="true"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {children}
      </section>
    </div>
  );
}
