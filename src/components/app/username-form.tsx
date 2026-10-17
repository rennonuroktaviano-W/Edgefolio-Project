"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AuthSubmitButton,
  Message,
  TextField,
  UserIcon,
} from "@/components/auth/auth-fields";

const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

export function UsernameForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availability, setAvailability] = useState<{
    forUsername: string;
    available: boolean | null;
  } | null>(null);

  const candidate = username.trim().toLowerCase();
  const valid = USERNAME_PATTERN.test(candidate);

  useEffect(() => {
    if (!valid) {
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/auth/username-available?username=${encodeURIComponent(candidate)}`,
        );
        const result = (await response.json()) as {
          available?: boolean | null;
        };
        if (!cancelled) {
          setAvailability({
            forUsername: candidate,
            available: result.available ?? null,
          });
        }
      } catch {
        if (!cancelled) {
          setAvailability({ forUsername: candidate, available: null });
        }
      }
    }, 420);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [candidate, valid]);

  const hint = (() => {
    if (!valid) {
      return {
        text: "3–24 characters: lowercase letters, numbers, underscore.",
        className: "text-faint",
      };
    }
    if (availability && availability.forUsername === candidate) {
      if (availability.available === true) {
        return { text: "Username is available.", className: "text-positive" };
      }
      if (availability.available === false) {
        return {
          text: "Username is already taken.",
          className: "text-negative",
        };
      }
      return {
        text: "Availability will be confirmed when you save.",
        className: "text-faint",
      };
    }
    return { text: "Checking availability…", className: "text-faint" };
  })();

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (!valid) {
      setError(
        "Username must be 3-24 characters: lowercase letters, numbers, or underscore.",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/profile/username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Could not save your username. Please try again.");
        return;
      }

      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="soft-frame reveal mb-8 rounded-2xl border border-accent/30 bg-surface-raised p-5 sm:p-6">
      <p className="text-xs font-semibold tracking-[0.28em] text-accent">
        ONE MORE STEP
      </p>
      <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink">
        Choose your username
      </h2>
      <p className="mt-2 max-w-xl text-sm text-muted">
        This is how you&apos;ll sign in and how others will see you. Pick it
        carefully — you can only set it once.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 max-w-md" noValidate>
        <TextField
          id="onboarding-username"
          label="Username"
          value={username}
          onChange={setUsername}
          autoComplete="username"
          required
          icon={<UserIcon />}
          placeholder="trader_01"
          hint={hint.text}
          hintClassName={hint.className}
        />

        <AuthSubmitButton
          loading={loading}
          label="Save username"
          pendingLabel="Saving…"
        />

        {error ? <Message tone="error">{error}</Message> : null}
      </form>
    </section>
  );
}
