// Per-tab marker: while a tab has authenticated (or reached the app), the
// landing page sends it straight to the dashboard. Closing the tab clears it,
// so a fresh visit shows the landing again even though the session cookie
// remains. Client-only — call these from client components/event handlers.
export const APP_SESSION_KEY = "edgefolio:app-session";

export function markAppSession() {
  try {
    window.sessionStorage.setItem(APP_SESSION_KEY, "1");
  } catch {
    // sessionStorage unavailable (e.g. blocked) — ignore.
  }
}

export function clearAppSession() {
  try {
    window.sessionStorage.removeItem(APP_SESSION_KEY);
  } catch {
    // ignore
  }
}

export function hasAppSession(): boolean {
  try {
    return window.sessionStorage.getItem(APP_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}
