import { createClient } from "@/lib/supabase/server";
import { clientIp, isRateLimited } from "@/lib/auth/rate-limit";
import { getRiskSettings, saveRiskSettings } from "@/lib/risk/queries";
import { validateRiskSettings } from "@/lib/risk/validate";

export async function GET() {
  const settings = await getRiskSettings();
  return Response.json({ settings });
}

export async function POST(request: Request) {
  if (isRateLimited(`risk:write:${clientIp(request)}`, 30, 60_000)) {
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

  const parsed = validateRiskSettings(payload);
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

  const settings = await saveRiskSettings(parsed.value, user);

  if (!settings) {
    return Response.json(
      { error: "We could not save your risk plan. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ settings });
}
