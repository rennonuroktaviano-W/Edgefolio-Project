import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited, clientIp } from "@/lib/auth/rate-limit";
import {
  isValidUsername,
  looksLikeEmail,
  normalizeEmail,
  normalizeUsername,
} from "@/lib/auth/validation";

const GENERIC_ERROR = "Incorrect username/email or password.";

export async function POST(request: Request) {
  if (isRateLimited(`signin:${clientIp(request)}`, 10, 60_000)) {
    return Response.json(
      { error: "Too many attempts. Please wait a moment." },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const identifier =
    typeof body.identifier === "string" ? body.identifier.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!identifier || !password) {
    return Response.json({ error: GENERIC_ERROR }, { status: 400 });
  }

  const supabase = await createClient();
  if (!supabase) {
    return Response.json(
      { error: "Authentication is not configured yet." },
      { status: 503 },
    );
  }

  let email: string | null = null;

  if (looksLikeEmail(identifier)) {
    email = normalizeEmail(identifier);
  } else {
    const username = normalizeUsername(identifier);
    if (!isValidUsername(username)) {
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const admin = createAdminClient();
    if (!admin) {
      return Response.json(
        {
          error:
            "Username sign-in is not available yet. Please sign in with your email.",
        },
        { status: 503 },
      );
    }

    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (!profile) {
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    const { data: userData, error: userError } =
      await admin.auth.admin.getUserById(
        (profile as { id: string }).id,
      );

    if (userError || !userData.user?.email) {
      return Response.json({ error: GENERIC_ERROR }, { status: 401 });
    }

    email = userData.user.email;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (error.code === "email_not_confirmed") {
      return Response.json(
        {
          error: "Please confirm your email address first.",
          code: "email_not_confirmed",
        },
        { status: 403 },
      );
    }
    return Response.json({ error: GENERIC_ERROR }, { status: 401 });
  }

  return Response.json({ ok: true });
}
