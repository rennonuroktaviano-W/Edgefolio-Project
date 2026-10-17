import { createClient } from "@/lib/supabase/server";
import { clientIp, isRateLimited } from "@/lib/auth/rate-limit";

type Context = { params: Promise<{ attachmentId: string }> };

const BUCKET = "journal-attachments";

export async function DELETE(request: Request, { params }: Context) {
  if (isRateLimited(`journal:upload:${clientIp(request)}`, 30, 60_000)) {
    return Response.json(
      { error: "Too many changes. Please slow down." },
      { status: 429 },
    );
  }

  const { attachmentId } = await params;

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
    .from("journal_attachments")
    .delete()
    .eq("id", attachmentId)
    .eq("user_id", user.id)
    .select("storage_path")
    .maybeSingle();

  if (error) {
    return Response.json(
      { error: "We could not remove this image. Please try again." },
      { status: 500 },
    );
  }
  if (!data) {
    return Response.json({ error: "Attachment not found." }, { status: 404 });
  }

  await supabase.storage
    .from(BUCKET)
    .remove([(data as { storage_path: string }).storage_path]);

  return Response.json({ ok: true });
}
