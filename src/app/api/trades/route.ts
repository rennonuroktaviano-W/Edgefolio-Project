import { createClient } from "@/lib/supabase/server";
import { clientIp, isRateLimited } from "@/lib/auth/rate-limit";
import { listTrades, toTrade, toTradeRow } from "@/lib/trades/queries";
import { validateTrade } from "@/lib/trades/validate";

export async function GET() {
  const trades = await listTrades();
  return Response.json({ trades });
}

export async function POST(request: Request) {
  if (isRateLimited(`trades:write:${clientIp(request)}`, 60, 60_000)) {
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

  const parsed = validateTrade(payload);
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

  const { data, error } = await supabase
    .from("trades")
    .insert({ ...toTradeRow(parsed.value), user_id: user.id })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[trades:insert]", error?.message ?? "no data returned");
    return Response.json(
      { error: "We could not save this trade. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ trade: toTrade(data) }, { status: 201 });
}
