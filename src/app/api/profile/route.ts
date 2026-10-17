import { createClient } from "@/lib/supabase/server";
import { isRateLimited, clientIp } from "@/lib/auth/rate-limit";

const MAX_DISPLAY_NAME = 60;

export async function POST(request: Request) {
  if (isRateLimited(`profile:${clientIp(request)}`, 20, 60_000)) {
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
  const raw = typeof body.displayName === "string" ? body.displayName : "";
  const displayName = raw.trim().replace(/\s+/g, " ");

  if (displayName.length > MAX_DISPLAY_NAME) {
    return Response.json(
      {
        error: `Display name must be ${MAX_DISPLAY_NAME} characters or fewer.`,
        field: "displayName",
      },
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

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName || null },
  });

  if (error) {
    return Response.json(
      { error: "We could not save your profile. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true, displayName: displayName || null });
}
