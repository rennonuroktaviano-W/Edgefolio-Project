import "server-only";

import { io } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { attachmentsFor, toJournalEntry } from "@/lib/journal/queries";
import type { Recap, RecapComment } from "@/lib/journal/types";

type EntryRow = Parameters<typeof toJournalEntry>[0] & { user_id: string };

type CountRow = { entry_id: string; user_id: string };
type CommentRow = {
  id: string;
  entry_id: string;
  user_id: string;
  author_username: string | null;
  author_display_name: string | null;
  body: string;
  created_at: string;
};

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function engagementFor(
  entryIds: string[],
  viewerId: string | null,
): Promise<
  Map<
    string,
    {
      likes: number;
      saves: number;
      comments: number;
      likedByMe: boolean;
      savedByMe: boolean;
    }
  >
> {
  const result = new Map<
    string,
    {
      likes: number;
      saves: number;
      comments: number;
      likedByMe: boolean;
      savedByMe: boolean;
    }
  >();
  if (entryIds.length === 0) return result;

  for (const id of entryIds) {
    result.set(id, {
      likes: 0,
      saves: 0,
      comments: 0,
      likedByMe: false,
      savedByMe: false,
    });
  }

  const supabase = await createClient();
  if (!supabase) return result;

  const [likes, saves, comments] = await Promise.all([
    supabase.from("recap_likes").select("entry_id, user_id").in("entry_id", entryIds),
    supabase.from("recap_saves").select("entry_id, user_id").in("entry_id", entryIds),
    supabase
      .from("recap_comments")
      .select("entry_id, user_id")
      .in("entry_id", entryIds),
  ]);

  for (const row of (likes.data as CountRow[] | null) ?? []) {
    const bucket = result.get(row.entry_id);
    if (!bucket) continue;
    bucket.likes += 1;
    if (viewerId && row.user_id === viewerId) bucket.likedByMe = true;
  }
  for (const row of (saves.data as CountRow[] | null) ?? []) {
    const bucket = result.get(row.entry_id);
    if (!bucket) continue;
    bucket.saves += 1;
    if (viewerId && row.user_id === viewerId) bucket.savedByMe = true;
  }
  for (const row of (comments.data as CountRow[] | null) ?? []) {
    const bucket = result.get(row.entry_id);
    if (!bucket) continue;
    bucket.comments += 1;
  }

  return result;
}

export type FeedSort = "foryou" | "latest";

export async function listRecaps(sort: FeedSort = "latest"): Promise<Recap[]> {
  await io();
  const supabase = await createClient();
  if (!supabase) return [];

  const viewerId = await currentUserId();

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("visibility", "public")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  const rows = data as EntryRow[];
  const [attachments, engagement] = await Promise.all([
    attachmentsFor(rows.map((row) => row.id)),
    engagementFor(
      rows.map((row) => row.id),
      viewerId,
    ),
  ]);

  const recaps: Recap[] = rows.map((row) => {
    const entry = toJournalEntry(row, attachments.get(row.id) ?? []);
    const counts = engagement.get(row.id);
    return {
      ...entry,
      likeCount: counts?.likes ?? 0,
      savedCount: counts?.saves ?? 0,
      commentCount: counts?.comments ?? 0,
      likedByMe: counts?.likedByMe ?? false,
      savedByMe: counts?.savedByMe ?? false,
      isMine: viewerId ? row.user_id === viewerId : false,
    } as Recap & { user_id?: string };
  });

  if (sort === "foryou") {
    recaps.sort((a, b) => {
      const scoreA = a.likeCount * 2 + a.commentCount * 3 + a.savedCount * 2;
      const scoreB = b.likeCount * 2 + b.commentCount * 3 + b.savedCount * 2;
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.createdAt < a.createdAt ? -1 : 1;
    });
  }

  return recaps;
}

export async function getRecap(id: string): Promise<Recap | null> {
  await io();
  const supabase = await createClient();
  if (!supabase) return null;

  const viewerId = await currentUserId();

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("visibility", "public")
    .maybeSingle();

  if (error || !data) return null;

  const row = data as EntryRow;
  const [attachments, engagement] = await Promise.all([
    attachmentsFor([row.id]),
    engagementFor([row.id], viewerId),
  ]);
  const counts = engagement.get(row.id);

  return {
    ...toJournalEntry(row, attachments.get(row.id) ?? []),
    likeCount: counts?.likes ?? 0,
    savedCount: counts?.saves ?? 0,
    commentCount: counts?.comments ?? 0,
    likedByMe: counts?.likedByMe ?? false,
    savedByMe: counts?.savedByMe ?? false,
    isMine: viewerId ? row.user_id === viewerId : false,
  };
}

export async function listComments(entryId: string): Promise<RecapComment[]> {
  await io();
  const supabase = await createClient();
  if (!supabase) return [];

  const viewerId = await currentUserId();

  const { data, error } = await supabase
    .from("recap_comments")
    .select("*")
    .eq("entry_id", entryId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return (data as CommentRow[]).map((row) => ({
    id: row.id,
    authorUsername: row.author_username,
    authorDisplayName: row.author_display_name,
    body: row.body,
    createdAt: row.created_at,
    isMine: viewerId ? row.user_id === viewerId : false,
  }));
}

export async function listSavedRecaps(): Promise<Recap[]> {
  await io();
  const supabase = await createClient();
  if (!supabase) return [];

  const viewerId = await currentUserId();
  if (!viewerId) return [];

  const { data: saves, error: saveError } = await supabase
    .from("recap_saves")
    .select("entry_id, created_at")
    .order("created_at", { ascending: false });

  if (saveError || !saves || saves.length === 0) return [];

  const ids = (saves as { entry_id: string }[]).map((row) => row.entry_id);

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .in("id", ids)
    .eq("visibility", "public");

  if (error || !data) return [];

  const rows = data as EntryRow[];
  const byId = new Map(rows.map((row) => [row.id, row]));
  const orderedRows = ids
    .map((id) => byId.get(id))
    .filter((row): row is EntryRow => Boolean(row));

  const [attachments, engagement] = await Promise.all([
    attachmentsFor(orderedRows.map((row) => row.id)),
    engagementFor(
      orderedRows.map((row) => row.id),
      viewerId,
    ),
  ]);

  return orderedRows.map((row) => {
    const counts = engagement.get(row.id);
    return {
      ...toJournalEntry(row, attachments.get(row.id) ?? []),
      likeCount: counts?.likes ?? 0,
      savedCount: counts?.saves ?? 0,
      commentCount: counts?.comments ?? 0,
      likedByMe: counts?.likedByMe ?? false,
      savedByMe: counts?.savedByMe ?? false,
      isMine: row.user_id === viewerId,
    };
  });
}

export async function listPublicRecapsByAuthor(
  username: string,
): Promise<{ recaps: Recap[]; displayName: string | null }> {
  await io();
  const supabase = await createClient();
  if (!supabase) return { recaps: [], displayName: null };

  const viewerId = await currentUserId();

  const { data, error } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("visibility", "public")
    .eq("author_username", username)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !data || data.length === 0) {
    return { recaps: [], displayName: null };
  }

  const rows = data as EntryRow[];
  const [attachments, engagement] = await Promise.all([
    attachmentsFor(rows.map((row) => row.id)),
    engagementFor(
      rows.map((row) => row.id),
      viewerId,
    ),
  ]);

  const recaps = rows.map((row) => {
    const counts = engagement.get(row.id);
    return {
      ...toJournalEntry(row, attachments.get(row.id) ?? []),
      likeCount: counts?.likes ?? 0,
      savedCount: counts?.saves ?? 0,
      commentCount: counts?.comments ?? 0,
      likedByMe: counts?.likedByMe ?? false,
      savedByMe: counts?.savedByMe ?? false,
      isMine: viewerId ? row.user_id === viewerId : false,
    };
  });

  return { recaps, displayName: rows[0]?.author_display_name ?? null };
}

export type LeaderboardRow = {
  username: string;
  displayName: string | null;
  recaps: number;
  totalR: number;
  wins: number;
  losses: number;
  winRate: number | null;
  avgR: number | null;
};

export type LeaderboardPeriod = "all" | "month" | "week";

// Ranks traders using ONLY the results they chose to publish in public recaps.
// Private trades never contribute. If nobody has shared results we return [].
export async function getLeaderboard(
  period: LeaderboardPeriod = "all",
): Promise<LeaderboardRow[]> {
  await io();
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("journal_entries")
    .select("author_username, author_display_name, result_r, outcome, created_at")
    .eq("visibility", "public")
    .not("author_username", "is", null);

  if (period !== "all") {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - (period === "month" ? 30 : 7));
    query = query.gte("entry_date", cutoff.toISOString().slice(0, 10));
  }

  const { data, error } = await query.limit(1000);
  if (error || !data) return [];

  type Row = {
    author_username: string | null;
    author_display_name: string | null;
    result_r: number | string | null;
    outcome: string | null;
  };

  const map = new Map<string, LeaderboardRow>();
  for (const raw of data as Row[]) {
    const username = raw.author_username;
    if (!username) continue;
    const hasResult =
      raw.result_r !== null || raw.outcome === "win" || raw.outcome === "loss";
    if (!hasResult) continue;

    const r = raw.result_r === null ? null : Number(raw.result_r);
    const row =
      map.get(username) ??
      ({
        username,
        displayName: raw.author_display_name,
        recaps: 0,
        totalR: 0,
        wins: 0,
        losses: 0,
        winRate: null,
        avgR: null,
      } satisfies LeaderboardRow);

    row.recaps += 1;
    if (r !== null && Number.isFinite(r)) row.totalR += r;
    if (raw.outcome === "win") row.wins += 1;
    if (raw.outcome === "loss") row.losses += 1;
    map.set(username, row);
  }

  const rows = [...map.values()].map((row) => {
    const decided = row.wins + row.losses;
    return {
      ...row,
      totalR: Math.round(row.totalR * 100) / 100,
      winRate: decided > 0 ? row.wins / decided : null,
      avgR: row.recaps > 0 ? row.totalR / row.recaps : null,
    };
  });

  return rows.sort((a, b) => b.totalR - a.totalR);
}
