import { createClient } from "@/lib/supabase/server";
import { clientIp, isRateLimited } from "@/lib/auth/rate-limit";

type Context = { params: Promise<{ id: string }> };

const BUCKET = "journal-attachments";
const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Map<string, string>([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
]);

export async function POST(request: Request, { params }: Context) {
  if (isRateLimited(`journal:upload:${clientIp(request)}`, 30, 60_000)) {
    return Response.json(
      { error: "Too many uploads. Please slow down." },
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

  // Confirm the entry belongs to the caller before accepting a file.
  const { data: entry } = await supabase
    .from("journal_entries")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!entry) {
    return Response.json({ error: "Entry not found." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No file was provided." }, { status: 400 });
  }

  const extension = ALLOWED.get(file.type);
  if (!extension) {
    return Response.json(
      { error: "Upload a PNG, JPG, WEBP, or GIF image." },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return Response.json(
      { error: "Images must be 5 MB or smaller." },
      { status: 400 },
    );
  }

  const path = `${user.id}/${id}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (uploadError) {
    return Response.json(
      { error: "We could not upload this image. Please try again." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("journal_attachments")
    .insert({ entry_id: id, user_id: user.id, storage_path: path })
    .select("id, storage_path")
    .single();

  if (error || !data) {
    await supabase.storage.from(BUCKET).remove([path]);
    return Response.json(
      { error: "We could not attach this image. Please try again." },
      { status: 500 },
    );
  }

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, 60 * 60);

  return Response.json(
    {
      attachment: {
        id: (data as { id: string }).id,
        storagePath: path,
        url: signed?.signedUrl ?? null,
      },
    },
    { status: 201 },
  );
}
