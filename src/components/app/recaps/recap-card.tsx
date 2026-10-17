"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/app/badge";
import { Button } from "@/components/app/button";
import {
  BookmarkIcon,
  CommentIcon,
  HeartIcon,
} from "@/components/app/icons";
import { Message } from "@/components/auth/auth-fields";
import type { Recap, RecapComment } from "@/lib/journal/types";
import { formatPrice, formatR } from "@/lib/trading/format";
import { RelativeTime } from "@/components/app/relative-time";

function initials(recap: Recap): string {
  const source = recap.authorDisplayName ?? recap.authorUsername ?? "?";
  return source.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() || "?";
}

export function RecapCard({
  recap,
  onSavedChange,
  detailHref,
}: {
  recap: Recap;
  onSavedChange?: () => void;
  detailHref?: string;
}) {
  const router = useRouter();
  const [liked, setLiked] = useState(recap.likedByMe);
  const [likeCount, setLikeCount] = useState(recap.likeCount);
  const [saved, setSaved] = useState(recap.savedByMe);
  const [savedCount, setSavedCount] = useState(recap.savedCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<RecapComment[] | null>(null);
  const [commentCount, setCommentCount] = useState(recap.commentCount);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const authorHref = recap.authorUsername
    ? `/community/${recap.authorUsername}`
    : null;

  async function toggleLike() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((count) => count + (nextLiked ? 1 : -1));
    try {
      const response = await fetch(`/api/recaps/${recap.id}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });
      if (!response.ok) throw new Error();
    } catch {
      setLiked(!nextLiked);
      setLikeCount((count) => count + (nextLiked ? -1 : 1));
    }
  }

  async function toggleSave() {
    const nextSaved = !saved;
    setSaved(nextSaved);
    setSavedCount((count) => count + (nextSaved ? 1 : -1));
    try {
      const response = await fetch(`/api/recaps/${recap.id}/save`, {
        method: nextSaved ? "POST" : "DELETE",
      });
      if (!response.ok) throw new Error();
      router.refresh();
      onSavedChange?.();
    } catch {
      setSaved(!nextSaved);
      setSavedCount((count) => count + (nextSaved ? -1 : 1));
    }
  }

  async function openComments() {
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && comments === null) {
      try {
        const response = await fetch(`/api/recaps/${recap.id}/comments`);
        const result = (await response.json()) as { comments?: RecapComment[] };
        setComments(result.comments ?? []);
      } catch {
        setComments([]);
      }
    }
  }

  async function postComment(event: React.FormEvent) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setPosting(true);
    setError(null);
    try {
      const response = await fetch(`/api/recaps/${recap.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const result = (await response.json()) as {
        comment?: RecapComment;
        error?: string;
      };
      if (!response.ok || !result.comment) {
        setError(result.error ?? "Could not post your comment.");
        return;
      }
      setComments((current) => [...(current ?? []), result.comment as RecapComment]);
      setCommentCount((count) => count + 1);
      setDraft("");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <article className="soft-frame rounded-2xl bg-surface-raised p-5 sm:p-6">
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-sm font-semibold text-accent">
          {initials(recap)}
        </span>
        <div className="min-w-0 flex-1">
          {authorHref ? (
            <Link
              href={authorHref}
              className="text-sm font-medium text-ink hover:text-accent"
            >
              {recap.authorDisplayName ?? `@${recap.authorUsername}`}
            </Link>
          ) : (
            <span className="text-sm font-medium text-ink">
              {recap.authorDisplayName ?? "Trader"}
            </span>
          )}
          <p className="text-xs text-faint">
            {recap.authorUsername ? `@${recap.authorUsername} · ` : ""}
            <RelativeTime value={recap.createdAt} />
          </p>
        </div>
        {recap.isMine ? <Badge tone="accent">You</Badge> : null}
      </header>

      <h2 className="mt-4 text-base font-semibold tracking-tight text-ink">
        {detailHref ? (
          <Link href={detailHref} className="hover:text-accent">
            {recap.title}
          </Link>
        ) : (
          recap.title
        )}
      </h2>

      {(recap.direction || recap.symbol || recap.resultR !== null) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {recap.symbol ? <Badge tone="accent">{recap.symbol}</Badge> : null}
          {recap.direction ? (
            <Badge tone={recap.direction === "long" ? "positive" : "negative"}>
              {recap.direction === "long" ? "Long" : "Short"}
            </Badge>
          ) : null}
          {recap.outcome ? (
            <Badge
              tone={
                recap.outcome === "win"
                  ? "positive"
                  : recap.outcome === "loss"
                    ? "negative"
                    : "warning"
              }
            >
              {recap.outcome === "win"
                ? "Win"
                : recap.outcome === "loss"
                  ? "Loss"
                  : "Breakeven"}
            </Badge>
          ) : null}
          {recap.resultR !== null ? (
            <Badge tone={recap.resultR >= 0 ? "positive" : "negative"}>
              {formatR(recap.resultR)}
            </Badge>
          ) : null}
        </div>
      )}

      {(recap.entryPrice !== null || recap.exitPrice !== null) && (
        <p className="mt-3 text-xs text-muted">
          Entry {recap.entryPrice === null ? "—" : formatPrice(recap.entryPrice)}
          {" → "}
          Exit {recap.exitPrice === null ? "—" : formatPrice(recap.exitPrice)}
        </p>
      )}

      {recap.thesis ? (
        <p className="mt-3 whitespace-pre-wrap text-sm text-muted">
          {recap.thesis}
        </p>
      ) : null}

      {recap.review ? (
        <div className="mt-3 rounded-xl border border-hairline bg-night/30 p-3.5">
          <p className="text-xs font-medium text-faint">Lesson</p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted">
            {recap.review}
          </p>
        </div>
      ) : null}

      {recap.attachments.length > 0 ? (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {recap.attachments.map((attachment) =>
            attachment.url ? (
              <li
                key={attachment.id}
                className="overflow-hidden rounded-xl border border-hairline"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={attachment.url}
                  alt="Chart screenshot"
                  className="h-28 w-full object-cover"
                />
              </li>
            ) : null,
          )}
        </ul>
      ) : null}

      <footer className="mt-5 flex items-center gap-1 border-t border-hairline pt-4">
        <ActionButton
          active={liked}
          tone="negative"
          onClick={toggleLike}
          label={likeCount === 1 ? "1 like" : `${likeCount} likes`}
          Icon={HeartIcon}
        />
        <ActionButton
          active={commentsOpen}
          tone="accent"
          onClick={openComments}
          label={commentCount === 1 ? "1 comment" : `${commentCount} comments`}
          Icon={CommentIcon}
        />
        <ActionButton
          active={saved}
          tone="accent"
          onClick={toggleSave}
          label={savedCount === 1 ? "1 save" : `${savedCount} saves`}
          Icon={BookmarkIcon}
        />
      </footer>

      {commentsOpen ? (
        <div className="mt-4 space-y-3 border-t border-hairline pt-4">
          {comments === null ? (
            <p className="text-sm text-faint">Loading comments…</p>
          ) : comments.length === 0 ? (
            <p className="text-sm text-faint">No comments yet. Start the discussion.</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li key={comment.id} className="flex gap-3">
                  <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline bg-surface text-[0.65rem] font-semibold text-accent">
                    {(comment.authorDisplayName ?? comment.authorUsername ?? "?")
                      .replace(/[^a-zA-Z0-9]/g, "")
                      .slice(0, 2)
                      .toUpperCase() || "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs text-faint">
                      {comment.authorDisplayName ??
                        (comment.authorUsername
                          ? `@${comment.authorUsername}`
                          : "Trader"                      )}{" "}
                      · <RelativeTime value={comment.createdAt} />
                    </p>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm text-muted">
                      {comment.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={postComment} className="flex gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a comment…"
              maxLength={1000}
              className="w-full rounded-xl border border-hairline bg-night/60 px-3.5 py-2.5 text-sm text-ink outline-none placeholder:text-faint focus:border-accent/70 focus:ring-2 focus:ring-accent/20"
            />
            <Button type="submit" variant="primary" size="sm" loading={posting}>
              Post
            </Button>
          </form>
          {error ? <Message tone="error">{error}</Message> : null}
        </div>
      ) : null}
    </article>
  );
}

function ActionButton({
  active,
  tone,
  onClick,
  label,
  Icon,
}: {
  active: boolean;
  tone: "accent" | "negative";
  onClick: () => void;
  label: string;
  Icon: (props: { className?: string }) => React.ReactElement;
}) {
  const activeClass =
    tone === "negative" ? "text-negative" : "text-accent";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active ? activeClass : "text-muted hover:bg-surface-strong hover:text-ink"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
