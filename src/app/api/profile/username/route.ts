import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited, clientIp } from "@/lib/auth/rate-limit";
import { isValidUsername, normalizeUsername } from "@/lib/auth/validation";

const INVALID_USERNAME =
  "Username must be 3-24 characters: lowercase letters, numbers, or underscore.";
const TAKEN_USERNAME = "That username is already taken.";

function isUniqueViolation(
  error: { code?: string; message?: string } | null,
): boolean {
  if (!error) {
    return false;
  }
  return (
    error.code === "23505" ||
    (error.message ?? "").toLowerCase().includes("duplicate key")
  );
}

export async function POST(request: Request) {
  if (isRateLimited(`profile-username:${clientIp(request)}`, 20, 60_000)) {
    return Response.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const rawUsername = typeof body.username === "string" ? body.username : "";
  const username = normalizeUsername(rawUsername);

  if (!rawUsername || !isValidUsername(username)) {
    return Response.json(
      { error: INVALID_USERNAME, field: "username" },
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
    return Response.json(
      { error: "You need to sign in first." },
      { status: 401 },
    );
  }

  const admin = createAdminClient();

  if (admin) {
    const { data: existing, error: lookupError } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (lookupError) {
      return Response.json(
        { error: "Could not verify the username. Please try again." },
        { status: 502 },
      );
    }

    if (existing && (existing as { id: string }).id !== user.id) {
      return Response.json(
        { error: TAKEN_USERNAME, field: "username" },
        { status: 409 },
      );
    }

    // Upsert so a missing profile row (e.g. a trigger hiccup) is repaired.
    const { error } = await admin
      .from("profiles")
      .upsert({ id: user.id, username }, { onConflict: "id" });

    if (error) {
      if (isUniqueViolation(error)) {
        return Response.json(
          { error: TAKEN_USERNAME, field: "username" },
          { status: 409 },
        );
      }
      return Response.json(
        { error: "We could not save your username. Please try again." },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, username });
  }

  // Fallback without the service-role key: rely on RLS + the unique index.
  const { error } = await supabase
    .from("profiles")
    .update({ username })
    .eq("id", user.id);

  if (error) {
    if (isUniqueViolation(error)) {
      return Response.json(
        { error: TAKEN_USERNAME, field: "username" },
        { status: 409 },
      );
    }
    return Response.json(
      { error: "We could not save your username. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, username });
}
