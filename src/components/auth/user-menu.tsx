"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAppSession } from "@/lib/auth/app-session";

type UserMenuProps = {
  username: string | null;
  email: string | null;
};

export function UserMenu({ username, email }: UserMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const label = username ?? email ?? "Account";
  const initial = label.charAt(0).toUpperCase();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      clearAppSession();
      setOpen(false);
      router.refresh();
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-hairline bg-surface-raised/80 py-1.5 pl-1.5 pr-3 text-sm text-ink backdrop-blur transition-colors hover:border-hairline-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-xs font-semibold text-night">
          {initial}
        </span>
        <span className="max-w-[8rem] truncate">{label}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-hairline bg-surface-raised/95 p-1 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        >
          {email ? (
            <p className="truncate px-3 py-2 text-xs text-faint">{email}</p>
          ) : null}
          <Link
            href="/explore"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-strong hover:text-ink"
          >
            Dashboard
          </Link>
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-strong hover:text-ink"
          >
            Account
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            disabled={signingOut}
            className="block w-full rounded-lg px-3 py-2 text-left text-sm text-negative transition-colors hover:bg-negative/10 disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
