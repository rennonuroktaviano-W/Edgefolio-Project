"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/app/button";
import { Badge } from "@/components/app/badge";
import { Modal } from "@/components/app/modal";
import { SearchField, SegmentedControl } from "@/components/app/form";
import { Select } from "@/components/app/select";
import { EmptyState } from "@/components/app/page-header";
import { JournalForm } from "@/components/app/journal/journal-form";
import { Message } from "@/components/auth/auth-fields";
import { JournalIcon } from "@/components/app/icons";
import type { JournalEntry } from "@/lib/journal/types";
import { formatDate, formatR } from "@/lib/trading/format";

type VisibilityFilter = "all" | "private" | "public";
type SortKey = "date" | "title";

export function JournalView({ entries }: { entries: JournalEntry[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<JournalEntry | undefined>(undefined);
  const [detail, setDetail] = useState<JournalEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries
      .filter((entry) => {
        if (visibility !== "all" && entry.visibility !== visibility) return false;
        if (needle) {
          const haystack =
            `${entry.title} ${entry.symbol ?? ""} ${entry.strategy ?? ""}`.toLowerCase();
          if (!haystack.includes(needle)) return false;
        }
        return true;
      })
      .sort((a, b) =>
        sort === "title"
          ? a.title.localeCompare(b.title)
          : b.entryDate.localeCompare(a.entryDate),
      );
  }, [entries, query, visibility, sort]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      const response = await fetch(`/api/journal/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not delete this entry.");
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
            label="Search journal"
            value={query}
            onChange={setQuery}
            placeholder="Search title, symbol, strategy"
          />
          <SegmentedControl
            label="Visibility"
            value={visibility}
            onChange={setVisibility}
            options={[
              { value: "all", label: "All" },
              { value: "private", label: "Private" },
              { value: "public", label: "Public" },
            ]}
          />
        </div>
        <div className="flex items-center gap-3">
          <Select
            label="Sort entries"
            value={sort}
            onChange={(value) => setSort(value as SortKey)}
            options={[
              { value: "date", label: "Newest first" },
              { value: "title", label: "Title A–Z" },
            ]}
            className="w-44"
          />
          <Button
            variant="primary"
            onClick={() => {
              setEditing(undefined);
              setFormOpen(true);
            }}
          >
            New entry
          </Button>
        </div>
      </div>

      {error ? <Message tone="error">{error}</Message> : null}

      {entries.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
          <EmptyState
            Icon={JournalIcon}
            title="Your journal is empty"
            description="Capture the thesis, psychology, and review behind your trades. Entries are private by default."
            action={
              <Button
                variant="primary"
                onClick={() => {
                  setEditing(undefined);
                  setFormOpen(true);
                }}
              >
                Write your first entry
              </Button>
            }
          />
        </div>
      ) : filtered.length === 0 ? (
        <div className="soft-frame rounded-2xl bg-surface-raised p-6">
          <EmptyState compact title="No matching entries" description="Try a different search or filter." />
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {filtered.map((entry) => (
            <li
              key={entry.id}
              className="soft-frame flex flex-col rounded-2xl bg-surface-raised p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  {entry.symbol ? (
                    <Badge tone="accent">{entry.symbol}</Badge>
                  ) : null}
                  <Badge tone={entry.visibility === "public" ? "info" : "muted"}>
                    {entry.visibility === "public" ? "Public" : "Private"}
                  </Badge>
                  {entry.outcome ? (
                    <Badge
                      tone={
                        entry.outcome === "win"
                          ? "positive"
                          : entry.outcome === "loss"
                            ? "negative"
                            : "warning"
                      }
                    >
                      {entry.outcome === "win"
                        ? "Win"
                        : entry.outcome === "loss"
                          ? "Loss"
                          : "Breakeven"}
                      {entry.resultR !== null ? ` · ${formatR(entry.resultR)}` : ""}
                    </Badge>
                  ) : null}
                </div>
                <span className="shrink-0 text-xs text-faint">
                  {formatDate(entry.entryDate)}
                </span>
              </div>

              <h3 className="mt-3 text-base font-semibold tracking-tight text-ink">
                {entry.title}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-sm text-muted">
                {entry.thesis ?? entry.review ?? "No thesis recorded yet."}
              </p>

              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setDetail(entry)}>
                  Read
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(entry);
                    setFormOpen(true);
                  }}
                >
                  Edit
                </Button>
                {entry.attachments.length > 0 ? (
                  <span className="ml-auto text-xs text-faint">
                    {entry.attachments.length} image
                    {entry.attachments.length > 1 ? "s" : ""}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? "Edit entry" : "New journal entry"}
        description="Private by default. Share it publicly to publish a recap."
        size="lg"
      >
        <JournalForm
          entry={editing}
          onDone={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <Modal
        open={detail !== null}
        onClose={() => setDetail(null)}
        title={detail?.title ?? "Entry"}
        description={detail ? formatDate(detail.entryDate) : undefined}
        size="lg"
      >
        {detail ? (
          <JournalDetail
            entry={detail}
            onEdit={() => {
              setEditing(detail);
              setDetail(null);
              setFormOpen(true);
            }}
            onDelete={() => setDeleteTarget(detail)}
          />
        ) : null}
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete entry?"
        description="This permanently removes the entry and its images."
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" loading={deleting} onClick={confirmDelete}>
              Delete entry
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted">
          “{deleteTarget?.title}” will be gone for good.
        </p>
      </Modal>
    </div>
  );
}

function JournalDetail({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const sections: { label: string; body: string | null }[] = [
    { label: "Thesis", body: entry.thesis },
    { label: "Psychology", body: entry.psychology },
    { label: "Post-trade review", body: entry.review },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={entry.visibility === "public" ? "info" : "muted"}>
          {entry.visibility === "public" ? "Public" : "Private"}
        </Badge>
        {entry.symbol ? <Badge tone="accent">{entry.symbol}</Badge> : null}
        {entry.strategy ? <Badge>{entry.strategy}</Badge> : null}
        {entry.mood ? <Badge>Mood: {entry.mood}</Badge> : null}
      </div>

      {(entry.direction || entry.resultR !== null || entry.entryPrice !== null) && (
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {entry.direction ? (
            <Fact label="Direction" value={entry.direction === "long" ? "Long" : "Short"} />
          ) : null}
          {entry.entryPrice !== null ? (
            <Fact label="Entry" value={String(entry.entryPrice)} />
          ) : null}
          {entry.exitPrice !== null ? (
            <Fact label="Exit" value={String(entry.exitPrice)} />
          ) : null}
          {entry.resultR !== null ? (
            <Fact label="Result" value={formatR(entry.resultR)} />
          ) : null}
        </dl>
      )}

      {sections.map((section) =>
        section.body ? (
          <div key={section.label}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
              {section.label}
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted">
              {section.body}
            </p>
          </div>
        ) : null,
      )}

      {entry.attachments.length > 0 ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">
            Chart screenshots
          </p>
          <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {entry.attachments.map((attachment) =>
              attachment.url ? (
                <li key={attachment.id} className="overflow-hidden rounded-xl border border-hairline">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={attachment.url}
                    alt="Chart screenshot"
                    className="h-32 w-full object-cover"
                  />
                </li>
              ) : null,
            )}
          </ul>
        </div>
      ) : null}

      <div className="flex justify-end gap-3 pt-1">
        <Button variant="danger" size="sm" onClick={onDelete}>
          Delete
        </Button>
        <Button variant="secondary" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-night/40 px-3.5 py-2.5">
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-0.5 text-sm text-ink">{value}</dd>
    </div>
  );
}
