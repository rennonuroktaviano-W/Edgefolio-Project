"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AuthSubmitButton,
  MailIcon,
  Message,
  TextField,
  UserIcon,
} from "@/components/auth/auth-fields";
import { clearAppSession } from "@/lib/auth/app-session";

export type SettingsUser = {
  email: string | null;
  displayName: string | null;
};

const readOnlyClasses =
  "flex items-center gap-2.5 rounded-xl border border-hairline bg-night/40 px-4 py-3 text-sm text-ink";

export function SettingsForm({ user }: { user: SettingsUser }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName }),
      });
      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Could not save your profile. Please try again.");
        return;
      }

      setNotice("Display name saved.");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      clearAppSession();
      router.refresh();
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Profile
        </h2>
        <p className="mt-1 text-sm text-muted">
          Your identity on Edgefolio.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-xs font-medium text-muted">Email</p>
            <div className={readOnlyClasses}>
              <MailIcon />
              <span className="truncate">{user.email ?? "—"}</span>
            </div>
            <p className="mt-1.5 text-xs text-faint">
              Used to sign in and recover your account.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 max-w-md" noValidate>
          <TextField
            id="settings-display-name"
            label="Display name"
            value={displayName}
            onChange={setDisplayName}
            placeholder="Your name"
            autoComplete="name"
            icon={<UserIcon />}
            hint="Used to greet you across the app."
          />

          <AuthSubmitButton
            loading={saving}
            label="Save changes"
            pendingLabel="Saving…"
          />

          {error ? <Message tone="error">{error}</Message> : null}
          {notice ? <Message tone="success">{notice}</Message> : null}
        </form>
      </section>

      <section className="soft-frame rounded-2xl bg-surface-raised p-6 sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-ink">
          Security
        </h2>
        <p className="mt-1 text-sm text-muted">
          Manage how you sign in to your account.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/auth/reset-password"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-hairline bg-surface px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-hairline-strong hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Change password
          </Link>

          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-negative/40 bg-negative/10 px-4 py-2.5 text-sm font-medium text-negative transition-colors hover:bg-negative/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </section>
    </div>
  );
}
