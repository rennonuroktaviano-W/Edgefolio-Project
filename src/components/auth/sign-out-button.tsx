"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      router.refresh();
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <button
      type="button"
      onClick={signOut}
      disabled={signingOut}
      className="inline-flex items-center justify-center rounded-full border border-hairline bg-surface px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-hairline-strong hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-60"
    >
      {signingOut ? "Signing out…" : "Sign out"}
    </button>
  );
}
