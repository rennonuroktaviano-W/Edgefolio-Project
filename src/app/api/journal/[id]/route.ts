import { createClient } from "@/lib/supabase/server";
import { clientIp, isRateLimited } from "@/lib/auth/rate-limit";
import { toJournalEntry, toJournalRow } from "@/lib/journal/queries";
import { validateJournal } from "@/lib/journal/validate";
import { readUsername } from "@/lib/auth/user-lookup";

type Context = { params: Promise<{ id: string }> };

function authorFrom(metadata: Record<string, unknown>) {
  const display =
    typeof metadata.display_name === "string" && metadata.display_name
      ? metadata.display_name
      : typeof metadata.full_name === "string" && metadata.full_name
        ? metadata.full_name
        : null;
  return { username: readUsername(metadata), displayName: display };
}

export async function PATCH(request: Request, { params }: Context) {
  if (isRateLimited(`journal:write:${clientIp(request)}`, 40, 60_000)) {
    return Response.json(
      { error: "Too many changes. Please slow down." },
      { status: 429 },
    );
  }

  const { id } = await params;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = validateJournal(payload);
  if (!parsed.ok) {
    return Response.json(
      { error: parsed.error, field: parsed.field },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  if (!supabase) {
    return Response.json(
      { error: "Authentication is not configured yet." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "You need to sign in first." }, { status: 401 });
  }

  const author = authorFrom((user.user_metadata ?? {}) as Record<string, unknown>);

  const { data, error } = await supabase
    .from("journal_entries")
    .update(toJournalRow(parsed.value, author))
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return Response.json(
      { error: "We could not update this entry. Please try again." },
      { status: 500 },
    );
  }
  if (!data) {
    return Response.json({ error: "Entry not found." }, { status: 404 });
  }

  return Response.json({ entry: toJournalEntry(data) });
}

export async function DELETE(request: Request, { params }: Context) {
  if (isRateLimited(`journal:write:${clientIp(request)}`, 40, 60_000)) {
    return Response.json(
      { error: "Too many changes. Please slow down." },
      { status: 429 },
    );
  }

  const { id } = await params;

  const supabase = await createClient();
  if (!supabase) {
    return Response.json(
      { error: "Authentication is not configured yet." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "You need to sign in first." }, { status: 401 });
  }

  // Remove attachment objects from storage first so nothing is orphaned.
  const { data: attachments } = await supabase
    .from("journal_attachments")
    .select("storage_path")
    .eq("entry_id", id)
    .eq("user_id", user.id);

  const paths = ((attachments as { storage_path: string }[] | null) ?? []).map(
    (row) => row.storage_path,
  );
  if (paths.length > 0) {
    await supabase.storage.from("journal-attachments").remove(paths);
  }

  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return Response.json(
      { error: "We could not delete this entry. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
