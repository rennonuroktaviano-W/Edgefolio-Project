"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Message, TextField } from "@/components/auth/auth-fields";
import {
  NumberField,
  SegmentedControl,
  TextAreaField,
} from "@/components/app/form";
import { Button } from "@/components/app/button";
import { AttachmentsManager } from "@/components/app/journal/attachments-manager";
import type {
  JournalEntry,
  JournalVisibility,
  TradeOutcome,
} from "@/lib/journal/types";
import type { TradeDirection } from "@/lib/trades/types";

type DirectionValue = "" | TradeDirection;
type OutcomeValue = "" | TradeOutcome;

function numberOrEmpty(value: number | null): string {
  return value === null || value === undefined ? "" : String(value);
}

function dateInput(value: string | null): string {
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Date().toISOString().slice(0, 10);
}

export function JournalForm({
  entry,
  onDone,
  onCancel,
}: {
  entry?: JournalEntry;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const editing = Boolean(entry);

  const [title, setTitle] = useState(entry?.title ?? "");
  const [entryDate, setEntryDate] = useState(dateInput(entry?.entryDate ?? null));
  const [visibility, setVisibility] = useState<JournalVisibility>(
    entry?.visibility ?? "private",
  );
  const [symbol, setSymbol] = useState(entry?.symbol ?? "");
  const [strategy, setStrategy] = useState(entry?.strategy ?? "");
  const [thesis, setThesis] = useState(entry?.thesis ?? "");
  const [psychology, setPsychology] = useState(entry?.psychology ?? "");
  const [review, setReview] = useState(entry?.review ?? "");
  const [mood, setMood] = useState(entry?.mood ?? "");

  const [direction, setDirection] = useState<DirectionValue>(
    entry?.direction ?? "",
  );
  const [entryPrice, setEntryPrice] = useState(
    numberOrEmpty(entry?.entryPrice ?? null),
  );
  const [exitPrice, setExitPrice] = useState(
    numberOrEmpty(entry?.exitPrice ?? null),
  );
  const [resultR, setResultR] = useState(numberOrEmpty(entry?.resultR ?? null));
  const [outcome, setOutcome] = useState<OutcomeValue>(entry?.outcome ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      title,
      entryDate,
      visibility,
      symbol,
      strategy,
      thesis,
      psychology,
      review,
      mood,
      direction: direction || null,
      entryPrice: entryPrice || null,
      exitPrice: exitPrice || null,
      resultR: resultR || null,
      outcome: outcome || null,
    };

    try {
      const response = await fetch(
        editing ? `/api/journal/${entry?.id}` : "/api/journal",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not save this entry.");
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
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="journal-title"
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="e.g. BTC breakout — patient entry"
          autoComplete="off"
        />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="journal-date"
              className="mb-1.5 block text-xs font-medium text-muted"
            >
              Date
            </label>
            <input
              id="journal-date"
              type="date"
              value={entryDate}
              onChange={(event) => setEntryDate(event.target.value)}
              className="w-full rounded-xl border border-hairline bg-night/60 px-3.5 py-3 text-sm text-ink outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/20"
            />
          </div>
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Visibility</p>
            <SegmentedControl
              label="Visibility"
              value={visibility}
              onChange={setVisibility}
              options={[
                { value: "private", label: "Private" },
                { value: "public", label: "Public" },
              ]}
            />
          </div>
        </div>
      </div>

      {visibility === "public" ? (
        <div className="rounded-xl border border-info/30 bg-info/5 px-4 py-3 text-xs text-info">
          Public entries appear in Explore and Community under your username.
          Your email is never shown.
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <TextField
          id="journal-symbol"
          label="Symbol"
          value={symbol}
          onChange={setSymbol}
          placeholder="Optional"
          autoComplete="off"
        />
        <TextField
          id="journal-strategy"
          label="Strategy"
          value={strategy}
          onChange={setStrategy}
          placeholder="Optional"
          autoComplete="off"
        />
        <TextField
          id="journal-mood"
          label="Mood"
          value={mood}
          onChange={setMood}
          placeholder="Optional, e.g. calm"
          autoComplete="off"
        />
      </div>

      <div className="rounded-2xl border border-hairline bg-night/30 p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
          Reported trade (optional)
        </p>
        <p className="mt-1 text-xs text-faint">
          Shown on your public recap if you make this entry public. Your actual
          trades stay private.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl
              label="Direction"
              value={direction}
              onChange={setDirection}
              options={[
                { value: "", label: "None" },
                { value: "long", label: "Long" },
                { value: "short", label: "Short" },
              ]}
            />
            <SegmentedControl
              label="Outcome"
              value={outcome}
              onChange={setOutcome}
              options={[
                { value: "", label: "None" },
                { value: "win", label: "Win" },
                { value: "loss", label: "Loss" },
                { value: "breakeven", label: "B/E" },
              ]}
            />
          </div>
          <NumberField
            id="journal-result-r"
            label="Result (R multiple)"
            value={resultR}
            onChange={setResultR}
            placeholder="e.g. 2.5 or -1"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <NumberField
            id="journal-entry-price"
            label="Entry price"
            value={entryPrice}
            onChange={setEntryPrice}
            placeholder="Optional"
            min="0"
          />
          <NumberField
            id="journal-exit-price"
            label="Exit price"
            value={exitPrice}
            onChange={setExitPrice}
            placeholder="Optional"
            min="0"
          />
        </div>
      </div>

      <TextAreaField
        id="journal-thesis"
        label="Thesis"
        value={thesis}
        onChange={setThesis}
        placeholder="Why this trade, the setup, and your plan."
        maxLength={4000}
        rows={4}
      />
      <TextAreaField
        id="journal-psychology"
        label="Psychology"
        value={psychology}
        onChange={setPsychology}
        placeholder="How you felt, what you were tempted to do."
        maxLength={4000}
        rows={3}
      />
      <TextAreaField
        id="journal-review"
        label="Post-trade review"
        value={review}
        onChange={setReview}
        placeholder="What went well, what to improve next time."
        maxLength={4000}
        rows={3}
      />

      {editing && entry ? (
        <div className="rounded-2xl border border-hairline bg-night/30 p-4 sm:p-5">
          <AttachmentsManager entryId={entry.id} initial={entry.attachments} />
        </div>
      ) : null}

      {error ? <Message tone="error">{error}</Message> : null}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" loading={saving}>
          {editing ? "Save changes" : "Create entry"}
        </Button>
      </div>
    </form>
  );
}
