"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth/redirect";
import { markAppSession } from "@/lib/auth/app-session";
import {
  AuthSubmitButton,
  Message,
  PasswordField,
} from "@/components/auth/auth-fields";

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setError("Authentication is not configured yet.");
      return;
    }

    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(
          "We could not update your password. The reset link may have expired.",
        );
        return;
      }

      setNotice("Password updated. Taking you to your dashboard…");
      markAppSession();
      router.refresh();
      router.replace(DEFAULT_AUTH_REDIRECT);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
      <PasswordField
        id="reset-password"
        label="New password"
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        placeholder="At least 8 characters"
        strength
      />

      <AuthSubmitButton
        loading={loading}
        label="Update password"
        pendingLabel="Updating…"
      />

      {error ? <Message tone="error">{error}</Message> : null}
      {notice ? <Message tone="success">{notice}</Message> : null}
    </form>
  );
}
