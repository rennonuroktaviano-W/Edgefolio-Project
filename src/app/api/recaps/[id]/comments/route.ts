import { createClient } from "@/lib/supabase/server";
import { clientIp, isRateLimited } from "@/lib/auth/rate-limit";
import { readUsername } from "@/lib/auth/user-lookup";

type Context = { params: Promise<{ id: string }> };

const MAX_COMMENT = 1000;

export async function POST(request: Request, { params }: Context) {
  if (isRateLimited(`recap:comment:${clientIp(request)}`, 40, 60_000)) {
    return Response.json(
      { error: "Too many comments. Please slow down." },
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

  const body =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>).body
      : null;
  const text = typeof body === "string" ? body.trim() : "";

  if (text.length < 1 || text.length > MAX_COMMENT) {
    return Response.json(
      { error: `Comments must be 1 to ${MAX_COMMENT} characters.` },
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
  const authorUsername = readUsername(metadata);
  const authorDisplayName =
    typeof metadata.display_name === "string" && metadata.display_name
      ? metadata.display_name
      : null;

  const { data, error } = await supabase
    .from("recap_comments")
    .insert({
      entry_id: id,
      user_id: user.id,
      author_username: authorUsername,
      author_display_name: authorDisplayName,
      body: text,
    })
    .select("id, body, created_at")
    .single();

  if (error || !data) {
    return Response.json(
      { error: "Could not post your comment. Please try again." },
      { status: 500 },
    );
  }

  return Response.json(
    {
      comment: {
        id: (data as { id: string }).id,
        body: text,
        createdAt: (data as { created_at: string }).created_at,
        authorUsername,
        authorDisplayName,
        isMine: true,
      },
    },
    { status: 201 },
  );
}
