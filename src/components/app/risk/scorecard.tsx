import { Badge } from "@/components/app/badge";

export type ScorecardRow = {
  label: string;
  // Actual value observed in the user's trades.
  actual: string;
  // The limit from the risk plan, formatted.
  limit: string;
  status: "pass" | "fail" | "skip";
  note?: string;
};

export function Scorecard({ rows }: { rows: ScorecardRow[] }) {
  const anyFail = rows.some((row) => row.status === "fail");

  return (
    <div className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">Scorecard risiko</p>
          <p className="mt-1 text-xs text-muted">
            Trade yang kamu catat diukur terhadap batas yang kamu tetapkan.
          </p>
        </div>
        <Badge tone={anyFail ? "warning" : "positive"}>
          {anyFail ? "Perlu perhatian" : "Sesuai rencana"}
        </Badge>
      </div>

      <ul className="mt-5 space-y-2">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-hairline bg-night/40 px-3.5 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm text-ink">{row.label}</p>
              {row.note ? (
                <p className="mt-0.5 text-xs text-faint">{row.note}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted">
                {row.actual} <span className="text-faint">/ {row.limit}</span>
              </span>
              <Badge
                tone={
                  row.status === "pass"
                    ? "positive"
                    : row.status === "fail"
                      ? "negative"
                      : "muted"
                }
              >
                {row.status === "pass"
                  ? "Lolos"
                  : row.status === "fail"
                    ? "Gagal"
                    : "Tanpa rencana"}
              </Badge>
            </div>
          </li>
        ))}
      </ul>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          Isi rencana risiko di atas untuk melihat scorecard kamu.
        </p>
      ) : null}
    </div>
  );
}
