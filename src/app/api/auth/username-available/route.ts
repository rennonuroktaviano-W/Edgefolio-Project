import { isRateLimited, clientIp } from "@/lib/auth/rate-limit";
import { isValidUsername, normalizeUsername } from "@/lib/auth/validation";
import { findUserByUsername } from "@/lib/auth/user-lookup";

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

  const lookup = await findUserByUsername(username);

  if (lookup.status === "unavailable") {
    // Cannot verify without the service-role key. The client falls back to
    // server-side validation on submit.
    return Response.json({ available: null, reason: "unavailable" });
  }

  return Response.json({ available: lookup.status === "missing" });
}
