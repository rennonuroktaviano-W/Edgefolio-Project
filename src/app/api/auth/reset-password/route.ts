import { createClient } from "@/lib/supabase/server";
import { isRateLimited, clientIp } from "@/lib/auth/rate-limit";
import { isValidEmail } from "@/lib/auth/validation";

export async function POST(request: Request) {
  if (isRateLimited(`reset:${clientIp(request)}`, 5, 60_000)) {
    return Response.json(
      { error: "Too many requests. Please wait a moment." },
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
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!isValidEmail(email)) {
    return Response.json(
      { error: "Enter a valid email address." },
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

  const origin = new URL(request.url).origin;

  // Always return the same success response so the endpoint cannot be used to
  // discover which emails have accounts.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
  });

  return Response.json({
    ok: true,
    message: "If an account exists for that email, we've sent a reset link.",
  });
}
