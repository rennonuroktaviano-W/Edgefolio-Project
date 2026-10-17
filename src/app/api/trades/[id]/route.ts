import { createClient } from "@/lib/supabase/server";
import { clientIp, isRateLimited } from "@/lib/auth/rate-limit";
import { toTrade, toTradeRow } from "@/lib/trades/queries";
import { validateTrade } from "@/lib/trades/validate";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  if (isRateLimited(`trades:write:${clientIp(request)}`, 60, 60_000)) {
    return Response.json(
      { error: "Too many changes. Please slow down." },
      { status: 429 },
    );
  }

  const { id } = await params;

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
    .update(toTradeRow(parsed.value))
    .eq("id", id)
    .eq("user_id", user.id)
    .select("*")
    .maybeSingle();

  if (error) {
    return Response.json(
      { error: "We could not update this trade. Please try again." },
      { status: 500 },
    );
  }
  if (!data) {
    return Response.json({ error: "Trade not found." }, { status: 404 });
  }

  return Response.json({ trade: toTrade(data) });
}

export async function DELETE(request: Request, { params }: Context) {
  if (isRateLimited(`trades:write:${clientIp(request)}`, 60, 60_000)) {
    return Response.json(
      { error: "Too many changes. Please slow down." },
      { status: 429 },
    );
  }

  const { id } = await params;

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

  const { error } = await supabase
    .from("trades")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return Response.json(
      { error: "We could not delete this trade. Please try again." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
