"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/app/button";
import { Message } from "@/components/auth/auth-fields";
import type { JournalAttachment } from "@/lib/journal/types";

export function AttachmentsManager({
  entryId,
  initial,
}: {
  entryId: string;
  initial: JournalAttachment[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch(`/api/journal/${entryId}/attachments`, {
        method: "POST",
        body: form,
      });
      const result = (await response.json()) as {
        attachment?: JournalAttachment;
        error?: string;
      };
      if (!response.ok || !result.attachment) {
        setError(result.error ?? "Could not upload this image.");
        return;
      }
      setAttachments((current) => [...current, result.attachment as JournalAttachment]);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function remove(id: string) {
    setError(null);
    const previous = attachments;
    setAttachments((current) => current.filter((item) => item.id !== id));
    try {
      const response = await fetch(`/api/journal/attachments/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        setAttachments(previous);
        setError("Could not remove this image.");
        return;
      }
      router.refresh();
    } catch {
      setAttachments(previous);
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted">Chart screenshots</p>
          <p className="text-xs text-faint">PNG, JPG, WEBP, or GIF. Max 5 MB.</p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          Add image
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </div>

      {attachments.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {attachments.map((attachment) => (
            <li
              key={attachment.id}
              className="group relative overflow-hidden rounded-xl border border-hairline bg-night/40"
            >
              {attachment.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attachment.url}
                  alt="Chart screenshot"
                  className="h-32 w-full object-cover"
                />
              ) : (
                <div className="grid h-32 place-items-center text-xs text-faint">
                  Unavailable
                </div>
              )}
              <button
                type="button"
                onClick={() => remove(attachment.id)}
                aria-label="Remove image"
                className="absolute right-2 top-2 rounded-lg border border-hairline bg-night/80 px-2 py-1 text-xs text-negative opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <Message tone="error">{error}</Message> : null}
    </div>
  );
}
