"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/components/auth/auth-provider";
import { useSidebarCollapsed } from "@/components/app/sidebar-context";
import { AccountIcon } from "@/components/app/icons";
import { clearAppSession } from "@/lib/auth/app-session";

export type SidebarUser = {
  username: string | null;
  email: string | null;
};

type SidebarAccountMenuProps = {
  user: SidebarUser | null;
};

function SignInButton({ collapsed }: { collapsed: boolean }) {
  const { openAuth } = useAuthModal();

  return (
    <button
      type="button"
      onClick={() => openAuth("signin")}
      title={collapsed ? "Sign in" : undefined}
      className={`flex w-full items-center gap-3 rounded-xl border border-hairline bg-surface px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:border-hairline-strong hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <AccountIcon className="h-5 w-5 shrink-0 text-muted" />
      {collapsed ? null : <span>Sign in</span>}
    </button>
  );
}

export function SidebarAccountMenu({ user }: SidebarAccountMenuProps) {
  const collapsed = useSidebarCollapsed();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  // This panel is streamed inside its own Suspense boundary, so it can hydrate
  // after AppShell's mount effect already applied the persisted collapse
  // preference. Defer applying `collapsed` until this component has mounted so
  // the first client render matches the server markup (always rendered expanded).
  const [mounted, setMounted] = useState(false);
  const showCollapsed = mounted && collapsed;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

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

  if (!user) {
    return <SignInButton collapsed={showCollapsed} />;
  }

  const label = user.username ?? user.email ?? "Account";
  const initial = label.charAt(0).toUpperCase();

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
        title={showCollapsed ? label : undefined}
        className={`flex w-full items-center gap-2.5 rounded-xl border border-hairline bg-surface py-1.5 text-sm text-ink transition-colors hover:border-hairline-strong hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
          showCollapsed ? "justify-center px-1.5" : "pl-1.5 pr-3"
        }`}
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent text-xs font-semibold text-night">
          {initial}
        </span>
        {showCollapsed ? null : (
          <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className={`absolute bottom-full z-30 mb-2 w-52 overflow-hidden rounded-2xl border border-hairline bg-surface-raised/95 p-1 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl ${
            showCollapsed ? "left-0" : "right-0"
          }`}
        >
          {user.email ? (
            <p className="truncate px-3 py-2 text-xs text-faint">{user.email}</p>
          ) : null}
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
