"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { APP_SESSION_KEY } from "@/lib/auth/app-session";

// Guards the auto-redirect so it only runs once per page load. Later mounts of
// the landing (for example when the user presses Back from /explore) must show
// the landing again, otherwise the back button/gesture would bounce them right
// back into the app.
let handledFirstMount = false;

// Rendered by the landing page. On the first mount of a fresh page load, if
// this tab already authenticated, skip the landing and go straight to the
// dashboard. When the proxy bounces an unauthenticated visitor off /explore it
// appends `?signedout=1`, which clears any stale marker here instead of looping.
export function AppSessionRedirect() {
  const router = useRouter();

  useEffect(() => {
    const firstMount = !handledFirstMount;
    handledFirstMount = true;

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

    // Only the initial landing view of this page load redirects into the app.
    if (!firstMount) {
      return;
    }

    let marked = false;
    try {
      marked = window.sessionStorage.getItem(APP_SESSION_KEY) === "1";
    } catch {
      // ignore
    }

    if (marked) {
      router.push("/explore");
    }
  }, [router]);

  return null;
}
