"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Message, TextField } from "@/components/auth/auth-fields";
import { TextAreaField } from "@/components/app/form";
import { Button } from "@/components/app/button";
import { AttachmentsManager } from "@/components/app/journal/attachments-manager";
import type { JournalEntry } from "@/lib/journal/types";

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
  const [symbol, setSymbol] = useState(entry?.symbol ?? "");
  const [strategy, setStrategy] = useState(entry?.strategy ?? "");
  const [thesis, setThesis] = useState(entry?.thesis ?? "");
  const [psychology, setPsychology] = useState(entry?.psychology ?? "");
  const [review, setReview] = useState(entry?.review ?? "");
  const [mood, setMood] = useState(entry?.mood ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      title,
      entryDate,
      visibility: "private",
      symbol,
      strategy,
      thesis,
      psychology,
      review,
      mood,
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
      </div>

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
