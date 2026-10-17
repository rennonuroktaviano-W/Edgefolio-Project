import { createClient } from "@/lib/supabase/server";
import { clientIp, isRateLimited } from "@/lib/auth/rate-limit";
import { listJournalEntries, toJournalEntry, toJournalRow } from "@/lib/journal/queries";
import { validateJournal } from "@/lib/journal/validate";
import { readUsername } from "@/lib/auth/user-lookup";

function authorFrom(metadata: Record<string, unknown>) {
  const display =
    typeof metadata.display_name === "string" && metadata.display_name
      ? metadata.display_name
      : typeof metadata.full_name === "string" && metadata.full_name
        ? metadata.full_name
        : null;
  return { username: readUsername(metadata), displayName: display };
}

export async function GET() {
  const entries = await listJournalEntries();
  return Response.json({ entries });
}

export async function POST(request: Request) {
  if (isRateLimited(`journal:write:${clientIp(request)}`, 40, 60_000)) {
    return Response.json(
      { error: "Too many changes. Please slow down." },
      { status: 429 },
    );
  }

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

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const author = authorFrom(metadata);

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({ ...toJournalRow(parsed.value, author), user_id: user.id })
    .select("*")
    .single();

  if (error || !data) {
    return Response.json(
      { error: "We could not save this entry. Please try again." },
      { status: 500 },
    );
  }

  return Response.json(
    { entry: toJournalEntry(data) },
    { status: 201 },
  );
}
