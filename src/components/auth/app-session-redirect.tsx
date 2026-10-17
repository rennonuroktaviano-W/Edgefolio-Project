"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { APP_SESSION_KEY } from "@/lib/auth/app-session";

// Rendered by the landing page. If this tab already authenticated during the
// current session, skip the landing and go straight to the dashboard. When the
// proxy bounces an unauthenticated visitor off /explore it appends
// `?signedout=1`, which clears any stale marker here instead of looping.
export function AppSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.has("signedout")) {
      try {
        window.sessionStorage.removeItem(APP_SESSION_KEY);
      } catch {
        // ignore
      }
      params.delete("signedout");
      const query = params.toString();
      window.history.replaceState(
        null,
        "",
        `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`,
      );
      return;
    }

    let marked = false;
    try {
      marked = window.sessionStorage.getItem(APP_SESSION_KEY) === "1";
    } catch {
      // ignore
    }

    if (marked) {
      router.replace("/explore");
    }
  }, [router]);

  return null;
}
