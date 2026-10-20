"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/app/button";
import { Badge } from "@/components/app/badge";
import { Modal } from "@/components/app/modal";
import { SegmentedControl, SearchField } from "@/components/app/form";
import { Select } from "@/components/app/select";
import { EmptyState } from "@/components/app/page-header";
import { TradeForm, type TradeRiskContext } from "@/components/app/trades/trade-form";
import { Message } from "@/components/auth/auth-fields";
import { TradesIcon } from "@/components/app/icons";
import { deriveTrade } from "@/lib/analytics/metrics";
import type { Trade } from "@/lib/trades/types";
import {
  formatDate,
  formatR,
  formatSignedMoney,
} from "@/lib/trading/format";

type DirectionFilter = "all" | "long" | "short";
type SortKey = "date" | "pnl" | "symbol";

export type Prefill = { size?: string | undefined; rr?: string | undefined };

export function TradesView({
  trades,
  prefill,
  risk,
}: {
  trades: Trade[];
  prefill?: Prefill;
  risk?: TradeRiskContext;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState<DirectionFilter>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [formOpen, setFormOpen] = useState(() => Boolean(prefill));
  const [activePrefill, setActivePrefill] = useState<Prefill | undefined>(prefill);
  const [editing, setEditing] = useState<Trade | undefined>(undefined);
  const [detail, setDetail] = useState<Trade | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Trade | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = trades.filter((trade) => {
      if (direction !== "all" && trade.direction !== direction) return false;
      if (needle) {
        const haystack = `${trade.symbol} ${trade.strategy ?? ""}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      return true;
    });

    return rows.sort((a, b) => {
      if (sort === "symbol") return a.symbol.localeCompare(b.symbol);
      if (sort === "pnl") {
        return deriveTrade(b).realizedPnl - deriveTrade(a).realizedPnl;
      }
      return new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime();
    });
  }, [trades, query, direction, sort]);

  function openCreate() {
    setEditing(undefined);
    setFormOpen(true);
  }

  function openEdit(trade: Trade) {
    setEditing(trade);
    setDetail(null);
    setActivePrefill(undefined);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setActivePrefill(undefined);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/trades/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not delete this trade.");
        return;
      }
      router.refresh();
      setDeleteTarget(null);
      setDetail(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-8 space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <SearchField
            label="Search trades"
            value={query}
            onChange={setQuery}
            placeholder="Search symbol or strategy"
          />
          <SegmentedControl
            label="Direction"
            value={direction}
            onChange={setDirection}
            options={[
              { value: "all", label: "Both" },
              { value: "long", label: "Long" },
              { value: "short", label: "Short" },
            ]}
          />
        </div>

        <div className="flex items-center gap-3">
          <Select
            label="Sort trades"
            value={sort}
            onChange={(value) => setSort(value as SortKey)}
            options={[
              { value: "date", label: "Newest first" },
              { value: "pnl", label: "Best P/L" },
              { value: "symbol", label: "Symbol A–Z" },
            ]}
            className="w-44"
          />
          <Button variant="primary" onClick={openCreate}>
            Add trade
          </Button>
        </div>
      </div>

      {error ? <Message tone="error">{error}</Message> : null}

      {trades.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          <EmptyState
            Icon={TradesIcon}
            title="No trades yet"
            description="Log your first trade to start building your performance history."
            action={
              <Button variant="primary" onClick={openCreate}>
                Add trade
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6">
          <EmptyState
            compact
            title="No matching trades"
            description="Try a different search or filter."
          />
        </div>
      ) : (
        <div className="soft-frame overflow-hidden rounded-2xl bg-surface-raised">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[52rem] text-left">
              <caption className="sr-only">Your trade history</caption>
              <thead>
                <tr className="text-xs text-muted">
                  <th scope="col" className="px-5 py-3 font-medium">Symbol</th>
                  <th scope="col" className="px-5 py-3 font-medium">Side</th>
                  <th scope="col" className="px-5 py-3 font-medium">Size</th>
                  <th scope="col" className="px-5 py-3 font-medium">Result</th>
                  <th scope="col" className="px-5 py-3 font-medium">R</th>
                  <th scope="col" className="px-5 py-3 font-medium">P/L</th>
                  <th scope="col" className="px-5 py-3 font-medium">Date</th>
                  <th scope="col" className="px-5 py-3 font-medium">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((trade) => {
                  const derived = deriveTrade(trade);
                  const pnl = derived.realizedPnl;
                  return (
                    <tr
                      key={trade.id}
                      className="border-t border-hairline transition-colors hover:bg-surface-strong/40"
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-ink">
                        {trade.symbol}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={trade.direction === "long" ? "positive" : "negative"}>
                          {trade.direction === "long" ? "Long" : "Short"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted">
                        {trade.quantity}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge tone={trade.outcome === "win" ? "positive" : "negative"}>
                          {trade.outcome === "win" ? "Win" : "Lose"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted">
                        {formatR(derived.realizedR)}
                      </td>
                      <td className="px-5 py-3.5 text-sm">
                        <span
                          className={pnl >= 0 ? "text-positive" : "text-negative"}
                        >
                          {formatSignedMoney(pnl)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted">
                        {formatDate(trade.openedAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => setDetail(trade)}>
                            View
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openEdit(trade)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => setDeleteTarget(trade)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <ul className="divide-y divide-hairline md:hidden">
            {filtered.map((trade) => {
              const derived = deriveTrade(trade);
              const pnl = derived.realizedPnl;
              return (
                <li key={trade.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">
                          {trade.symbol}
                        </span>
                        <Badge
                          tone={trade.direction === "long" ? "positive" : "negative"}
                        >
                          {trade.direction === "long" ? "Long" : "Short"}
                        </Badge>
                        <Badge tone={trade.outcome === "win" ? "positive" : "negative"}>
                          {trade.outcome === "win" ? "Win" : "Lose"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {formatDate(trade.openedAt)} · {trade.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-medium ${
                          pnl >= 0 ? "text-positive" : "text-negative"
                        }`}
                      >
                        {formatSignedMoney(pnl)}
                      </p>
                      <p className="text-xs text-faint">{formatR(derived.realizedR)}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setDetail(trade)}>
                      View
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(trade)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(trade)}>
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={closeForm}
        title={editing ? "Edit trade" : "Add trade"}
        description="Sizes and notes are private to your account."
        size="lg"
      >
        <TradeForm
          trade={editing}
          prefill={editing ? undefined : activePrefill}
          risk={risk}
          onDone={closeForm}
          onCancel={closeForm}
        />
      </Modal>

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail ? `${detail.symbol} · ${detail.direction === "long" ? "Long" : "Short"}` : "Trade"}
        description={detail ? formatDate(detail.openedAt) : undefined}
      >
        {detail ? <TradeDetail trade={detail} onEdit={openEdit} onDelete={setDeleteTarget} /> : null}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete trade?"
        description="This permanently removes the trade from your history."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>
              Delete trade
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          {deleteTarget?.symbol} opened on{" "}
          {deleteTarget ? formatDate(deleteTarget.openedAt) : ""}. This action
          cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

function TradeDetail({
  trade,
  onEdit,
  onDelete,
}: {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (trade: Trade) => void;
}) {
  const derived = deriveTrade(trade);
  const rows: { label: string; value: string }[] = [
    {
      label: "Result",
      value: trade.outcome === "win" ? "Win" : "Lose",
    },
    { label: "Size", value: trade.quantity },
    {
      label: "Planned R:R",
      value: trade.plannedRR === null ? "—" : formatR(trade.plannedRR),
    },
    { label: "Strategy", value: trade.strategy ?? "—" },
    {
      label: "Realised P/L",
      value: formatSignedMoney(derived.realizedPnl),
    },
    {
      label: "Realised R",
      value: formatR(derived.realizedR),
    },
  ];

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="rounded-xl border border-hairline bg-night/40 px-3.5 py-2.5"
          >
            <dt className="text-xs text-faint">{row.label}</dt>
            <dd className="mt-0.5 text-sm text-ink">{row.value}</dd>
          </div>
        ))}
      </dl>

      {trade.notes ? (
        <div className="rounded-xl border border-hairline bg-night/40 p-4">
          <p className="text-xs text-faint">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
            {trade.notes}
          </p>
        </div>
      ) : null}

      <div className="flex justify-end gap-3 pt-1">
        <Button variant="danger" size="sm" onClick={() => onDelete(trade)}>
          Delete
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onEdit(trade)}>
          Edit
        </Button>
      </div>
    </div>
  );
}
