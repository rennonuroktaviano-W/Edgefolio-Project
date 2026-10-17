import { createClient } from "@/lib/supabase/server";
import { isRateLimited, clientIp } from "@/lib/auth/rate-limit";
import { isValidUsername, normalizeUsername } from "@/lib/auth/validation";
import { findUserByUsername } from "@/lib/auth/user-lookup";

const INVALID_USERNAME =
  "Username must be 3-24 characters: lowercase letters, numbers, or underscore.";
const TAKEN_USERNAME = "That username is already taken.";

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

  // Availability check when the service-role key is present. Without it we
  // still save; unique-ness across accounts is best-effort in that case.
  const lookup = await findUserByUsername(username);

  if (lookup.status === "found" && lookup.id !== user.id) {
    return Response.json(
      { error: TAKEN_USERNAME, field: "username" },
      { status: 409 },
    );
  }

  const { error } = await supabase.auth.updateUser({ data: { username } });

  if (error) {
    return Response.json(
      { error: "We could not save your username. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, username });
}
