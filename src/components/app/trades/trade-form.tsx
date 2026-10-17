"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TextField } from "@/components/auth/auth-fields";
import {
  NumberField,
  SegmentedControl,
  TextAreaField,
} from "@/components/app/form";
import { Button } from "@/components/app/button";
import { Message } from "@/components/auth/auth-fields";
import type { Trade, TradeDirection, TradeStatus } from "@/lib/trades/types";

export function toLocalInput(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromLocalInput(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function numberOrEmpty(value: number | null): string {
  return value === null || value === undefined ? "" : String(value);
}

export function TradeForm({
  trade,
  onDone,
  onCancel,
}: {
  trade?: Trade;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const editing = Boolean(trade);

  const [symbol, setSymbol] = useState(trade?.symbol ?? "");
  const [direction, setDirection] = useState<TradeDirection>(
    trade?.direction ?? "long",
  );
  const [status, setStatus] = useState<TradeStatus>(trade?.status ?? "closed");
  const [entryPrice, setEntryPrice] = useState(
    numberOrEmpty(trade?.entryPrice ?? null),
  );
  const [exitPrice, setExitPrice] = useState(
    numberOrEmpty(trade?.exitPrice ?? null),
  );
  const [quantity, setQuantity] = useState(
    numberOrEmpty(trade?.quantity ?? null),
  );
  const [stopLoss, setStopLoss] = useState(numberOrEmpty(trade?.stopLoss ?? null));
  const [takeProfit, setTakeProfit] = useState(
    numberOrEmpty(trade?.takeProfit ?? null),
  );
  const [fees, setFees] = useState(numberOrEmpty(trade?.fees ?? 0));
  const [strategy, setStrategy] = useState(trade?.strategy ?? "");
  const [openedAt, setOpenedAt] = useState(toLocalInput(trade?.openedAt ?? null));
  const [closedAt, setClosedAt] = useState(
    toLocalInput(trade?.closedAt ?? trade?.openedAt ?? null),
  );
  const [notes, setNotes] = useState(trade?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      symbol,
      direction,
      status,
      entryPrice,
      exitPrice: status === "closed" ? exitPrice : null,
      quantity,
      stopLoss: stopLoss || null,
      takeProfit: takeProfit || null,
      fees: fees || 0,
      strategy,
      openedAt: fromLocalInput(openedAt),
      closedAt: status === "closed" ? fromLocalInput(closedAt) : null,
      notes,
    };

    try {
      const response = await fetch(
        editing ? `/api/trades/${trade?.id}` : "/api/trades",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not save this trade.");
        return;
      }

      router.refresh();
      onDone();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="trade-symbol"
          label="Symbol"
          value={symbol}
          onChange={setSymbol}
          placeholder="e.g. BTCUSD"
          autoComplete="off"
        />
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Direction</p>
          <div className="flex gap-3">
            <SegmentedControl
              label="Direction"
              value={direction}
              onChange={setDirection}
              options={[
                { value: "long", label: "Long" },
                { value: "short", label: "Short" },
              ]}
            />
            <SegmentedControl
              label="Status"
              value={status}
              onChange={setStatus}
              options={[
                { value: "open", label: "Open" },
                { value: "closed", label: "Closed" },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField
          id="trade-entry"
          label="Entry price"
          value={entryPrice}
          onChange={setEntryPrice}
          placeholder="0.00"
          min="0"
        />
        {status === "closed" ? (
          <NumberField
            id="trade-exit"
            label="Exit price"
            value={exitPrice}
            onChange={setExitPrice}
            placeholder="0.00"
            min="0"
          />
        ) : (
          <div className="hidden sm:block" />
        )}
        <NumberField
          id="trade-quantity"
          label="Quantity / size"
          value={quantity}
          onChange={setQuantity}
          placeholder="0"
          min="0"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField
          id="trade-stop"
          label="Stop loss"
          value={stopLoss}
          onChange={setStopLoss}
          placeholder="Optional"
          min="0"
          hint="Used to compute risk (R)."
        />
        <NumberField
          id="trade-target"
          label="Take profit"
          value={takeProfit}
          onChange={setTakeProfit}
          placeholder="Optional"
          min="0"
        />
        <NumberField
          id="trade-fees"
          label="Fees"
          value={fees}
          onChange={setFees}
          placeholder="0.00"
          min="0"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="trade-strategy"
          label="Strategy"
          value={strategy}
          onChange={setStrategy}
          placeholder="Optional, e.g. Breakout"
          autoComplete="off"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="trade-opened"
              className="mb-1.5 block text-xs font-medium text-muted"
            >
              Opened
            </label>
            <input
              id="trade-opened"
              type="datetime-local"
              value={openedAt}
              onChange={(event) => setOpenedAt(event.target.value)}
              className="w-full rounded-xl border border-hairline bg-night/60 px-3.5 py-3 text-sm text-ink outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/20"
            />
          </div>
          {status === "closed" ? (
            <div>
              <label
                htmlFor="trade-closed"
                className="mb-1.5 block text-xs font-medium text-muted"
              >
                Closed
              </label>
              <input
                id="trade-closed"
                type="datetime-local"
                value={closedAt}
                onChange={(event) => setClosedAt(event.target.value)}
                className="w-full rounded-xl border border-hairline bg-night/60 px-3.5 py-3 text-sm text-ink outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/20"
              />
            </div>
          ) : null}
        </div>
      </div>

      <TextAreaField
        id="trade-notes"
        label="Notes"
        value={notes}
        onChange={setNotes}
        placeholder="Why you took the trade, mistakes, observations…"
        maxLength={2000}
        rows={3}
      />

      {error ? <Message tone="error">{error}</Message> : null}

      <div className="flex justify-end gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {editing ? "Save changes" : "Add trade"}
        </Button>
      </div>
    </form>
  );
}
