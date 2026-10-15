import { createAdminClient } from "@/lib/supabase/admin";
import { isRateLimited, clientIp } from "@/lib/auth/rate-limit";
import { isValidUsername, normalizeUsername } from "@/lib/auth/validation";

export async function GET(request: Request) {
  if (isRateLimited(`username:${clientIp(request)}`, 30, 60_000)) {
    return Response.json(
      { error: "Too many lookups. Please wait a moment." },
      { status: 429 },
    );
  }

  const username = normalizeUsername(
    new URL(request.url).searchParams.get("username") ?? "",
  );

  if (!isValidUsername(username)) {
    return Response.json({ available: false, reason: "invalid" });
  }

  const admin = createAdminClient();
  if (!admin) {
    // Cannot verify without the service-role key. The client will fall back to
    // server-side validation on submit.
    return Response.json({ available: null, reason: "unavailable" });
  }

  const { data, error } = await admin
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return Response.json({ available: null, reason: "error" }, { status: 500 });
  }

  return Response.json({ available: !data });
}
