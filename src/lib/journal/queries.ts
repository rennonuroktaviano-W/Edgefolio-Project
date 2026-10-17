import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  JournalAttachment,
  JournalEntry,
  JournalInput,
} from "@/lib/journal/types";

const BUCKET = "journal-attachments";
const SIGNED_URL_TTL = 60 * 60; // 1 hour

type EntryRow = {
  id: string;
  title: string;
  symbol: string | null;
  strategy: string | null;
  thesis: string | null;
  psychology: string | null;
  review: string | null;
  mood: string | null;
  trade_id: string | null;
  visibility: string;
  entry_date: string;
  direction: string | null;
  entry_price: number | string | null;
  exit_price: number | string | null;
  result_r: number | string | null;
  outcome: string | null;
  author_username: string | null;
  author_display_name: string | null;
  created_at: string;
  updated_at: string;
};

function num(value: number | string | null): number | null {
  if (value === null) return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asDirection(value: string | null): "long" | "short" | null {
  return value === "long" || value === "short" ? value : null;
}

function asOutcome(value: string | null): "win" | "loss" | "breakeven" | null {
  return value === "win" || value === "loss" || value === "breakeven"
    ? value
    : null;
}

type AttachmentRow = {
  id: string;
  entry_id: string;
  storage_path: string;
};

export function toJournalEntry(
  row: EntryRow,
  attachments: JournalAttachment[] = [],
): JournalEntry {
  return {
    id: row.id,
    title: row.title,
    symbol: row.symbol,
    strategy: row.strategy,
    thesis: row.thesis,
    psychology: row.psychology,
    review: row.review,
    mood: row.mood,
    tradeId: row.trade_id,
    visibility: row.visibility === "public" ? "public" : "private",
    entryDate: row.entry_date,
    direction: asDirection(row.direction),
    entryPrice: num(row.entry_price),
    exitPrice: num(row.exit_price),
    resultR: num(row.result_r),
    outcome: asOutcome(row.outcome),
    authorUsername: row.author_username,
    authorDisplayName: row.author_display_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    attachments,
  };
}

export function toJournalRow(input: JournalInput, author?: {
  username: string | null;
  displayName: string | null;
}) {
  return {
    title: input.title,
    symbol: input.symbol,
    strategy: input.strategy,
    thesis: input.thesis,
    psychology: input.psychology,
    review: input.review,
    mood: input.mood,
    trade_id: input.tradeId,
    visibility: input.visibility,
    entry_date: input.entryDate,
    direction: input.direction,
    entry_price: input.entryPrice,
    exit_price: input.exitPrice,
    result_r: input.resultR,
    outcome: input.outcome,
    ...(author
      ? {
          author_username: author.username,
          author_display_name: author.displayName,
        }
      : {}),
  };
}

// Signed URLs so a private bucket can still render images. The admin client
// can sign any object (needed to show other authors' public recap images);
// falls back to the user's own client when the service key is absent.
async function signedUrlsFor(paths: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (paths.length === 0) return map;

  const admin = createAdminClient();
  const client = admin ?? (await createClient());
  if (!client) return map;

  const { data } = await client.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL);

  for (const item of data ?? []) {
    if (item.path && item.signedUrl) {
      map.set(item.path, item.signedUrl);
    }
  }
  return map;
}

export async function attachmentsFor(
  entryIds: string[],
): Promise<Map<string, JournalAttachment[]>> {
  const result = new Map<string, JournalAttachment[]>();
  if (entryIds.length === 0) return result;

  const supabase = await createClient();
  if (!supabase) return result;

  const { data, error } = await supabase
    .from("journal_attachments")
    .select("id, entry_id, storage_path")
    .in("entry_id", entryIds);

  if (error || !data) return result;

  const rows = data as AttachmentRow[];
  const urls = await signedUrlsFor(rows.map((row) => row.storage_path));

  for (const row of rows) {
    const list = result.get(row.entry_id) ?? [];
    list.push({
      id: row.id,
      storagePath: row.storage_path,
      url: urls.get(row.storage_path) ?? null,
    });
    result.set(row.entry_id, list);
  }

  return result;
}

export async function listJournalEntries(): Promise<JournalEntry[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const rows = data as EntryRow[];
  const attachments = await attachmentsFor(rows.map((row) => row.id));

  return rows.map((row) => toJournalEntry(row, attachments.get(row.id) ?? []));
}

export async function getJournalEntry(id: string): Promise<JournalEntry | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as EntryRow;
  const attachments = await attachmentsFor([row.id]);
  return toJournalEntry(row, attachments.get(row.id) ?? []);
}
