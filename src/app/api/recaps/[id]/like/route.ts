import { createClient } from "@/lib/supabase/server";
import { clientIp, isRateLimited } from "@/lib/auth/rate-limit";

type Context = { params: Promise<{ id: string }> };

async function guard() {
  const supabase = await createClient();
  if (!supabase) {
    return {
      error: Response.json(
        { error: "Authentication is not configured yet." },
        { status: 503 },
      ),
    };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: Response.json(
        { error: "You need to sign in first." },
        { status: 401 },
      ),
    };
  }
  return { supabase, user };
}

export async function POST(request: Request, { params }: Context) {
  if (isRateLimited(`recap:like:${clientIp(request)}`, 120, 60_000)) {
    return Response.json({ error: "Too many actions." }, { status: 429 });
  }
  const { id } = await params;
  const ctx = await guard();
  if ("error" in ctx) return ctx.error;

  const { error } = await ctx.supabase
    .from("recap_likes")
    .upsert({ entry_id: id, user_id: ctx.user.id }, { onConflict: "entry_id,user_id" });

  if (error) {
    return Response.json({ error: "Could not like this recap." }, { status: 500 });
  }
  return Response.json({ ok: true, liked: true });
}

export async function DELETE(request: Request, { params }: Context) {
  if (isRateLimited(`recap:like:${clientIp(request)}`, 120, 60_000)) {
    return Response.json({ error: "Too many actions." }, { status: 429 });
  }
  const { id } = await params;
  const ctx = await guard();
  if ("error" in ctx) return ctx.error;

  const { error } = await ctx.supabase
    .from("recap_likes")
    .delete()
    .eq("entry_id", id)
    .eq("user_id", ctx.user.id);

  if (error) {
    return Response.json({ error: "Could not unlike this recap." }, { status: 500 });
  }
  return Response.json({ ok: true, liked: false });
}
