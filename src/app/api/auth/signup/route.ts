import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited, clientIp } from "@/lib/auth/rate-limit";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth/redirect";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
} from "@/lib/auth/validation";

export async function POST(request: Request) {
  if (isRateLimited(`signup:${clientIp(request)}`, 10, 60_000)) {
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
  const rawEmail = typeof body.email === "string" ? body.email : "";
  const rawPassword = typeof body.password === "string" ? body.password : "";
  const rawUsername = typeof body.username === "string" ? body.username : "";
  const rawDisplayName =
    typeof body.displayName === "string" ? body.displayName.trim() : "";

  const email = rawEmail.trim().toLowerCase();
  const username = rawUsername.trim().toLowerCase();
  const displayName = rawDisplayName.slice(0, 80);

  if (!rawEmail || !isValidEmail(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!rawPassword || !isValidPassword(rawPassword)) {
    return Response.json(
      { error: "Password must be at least 8 characters." },
      { status: 400 },
    );
  }

  if (!rawUsername || !isValidUsername(username)) {
    return Response.json(
      {
        error:
          "Username must be 3-24 characters: lowercase letters, numbers, or underscore.",
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

  // Pre-flight availability check when the service-role key is present. The
  // DB trigger + unique index still guarantee uniqueness without it.
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

    if (existing) {
      return Response.json(
        { error: "That username is already taken.", field: "username" },
        { status: 409 },
      );
    }
  }

  const origin = new URL(request.url).origin;

  const { data, error } = await supabase.auth.signUp({
    email,
    password: rawPassword,
    options: {
      data: {
        username,
        display_name: displayName || null,
      },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(
        DEFAULT_AUTH_REDIRECT,
      )}`,
    },
  });

  if (error) {
    const message = error.message.toLowerCase();
    if (message.includes("already") || message.includes("registered")) {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }
    if (message.includes("username") || message.includes("profiles")) {
      return Response.json(
        { error: "That username is already taken.", field: "username" },
        { status: 409 },
      );
    }
    if (message.includes("password")) {
      return Response.json(
        { error: "Password does not meet the requirements." },
        { status: 400 },
      );
    }
    return Response.json(
      { error: "We could not create your account. Please try again." },
      { status: 400 },
    );
  }

  return Response.json({
    ok: true,
    needsEmailConfirmation: !data.session,
  });
}
