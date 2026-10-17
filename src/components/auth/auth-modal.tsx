"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth/redirect";
import { markAppSession } from "@/lib/auth/app-session";
import {
  AuthSubmitButton,
  MailIcon,
  Message,
  PasswordField,
  TextField,
  UserIcon,
} from "@/components/auth/auth-fields";

export type AuthMode = "signin" | "signup" | "reset";

const USERNAME_PATTERN = /^[a-z0-9_]{3,24}$/;

const COPY: Record<AuthMode, { title: string; subtitle: string }> = {
  signin: {
    title: "Welcome back",
    subtitle: "Sign in with your username or email to continue.",
  },
  signup: {
    title: "Create your account",
    subtitle: "Start tracking your trades with Edgefolio.",
  },
  reset: {
    title: "Reset your password",
    subtitle: "We'll email you a secure link to choose a new one.",
  },
};

type AuthModalProps = {
  initialMode: AuthMode;
  initialError?: string | null;
  onClose: () => void;
};

export function AuthModal({
  initialMode,
  initialError = null,
  onClose,
}: AuthModalProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [notice, setNotice] = useState<string | null>(null);
  const [availability, setAvailability] = useState<{
    forUsername: string;
    available: boolean | null;
  } | null>(null);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusTimer = window.setTimeout(() => {
      panelRef.current
        ?.querySelector<HTMLElement>(
          'input, button:not([data-auth-close="true"])',
        )
        ?.focus();
    }, 20);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  useEffect(() => {
    if (mode !== "signup") {
      return;
    }

    const candidate = username.trim().toLowerCase();
    if (!USERNAME_PATTERN.test(candidate)) {
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
  }, [username, mode]);

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setNotice(null);
  }

  async function handleSignIn(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Sign in failed. Please try again.");
        return;
      }

      onClose();
      markAppSession();
      router.refresh();
      router.push(DEFAULT_AUTH_REDIRECT);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, displayName }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        needsEmailConfirmation?: boolean;
      };

      if (!response.ok) {
        setError(result.error ?? "Sign up failed. Please try again.");
        return;
      }

      if (result.needsEmailConfirmation) {
        setNotice(
          "Account created. Check your email to confirm your address, then sign in.",
        );
        return;
      }

      onClose();
      markAppSession();
      router.refresh();
      router.push(DEFAULT_AUTH_REDIRECT);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);

    if (!email.trim()) {
      setError("Enter the email address for your account.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as {
        ok?: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        setError(result.error ?? "Could not send the reset link.");
        return;
      }

      setNotice(
        result.message ??
          "If an account exists for that email, we've sent a reset link.",
      );
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const usernameCandidate = username.trim().toLowerCase();
  const usernameValid = USERNAME_PATTERN.test(usernameCandidate);
  const usernameHint = (() => {
    if (!usernameValid) {
      return {
        text: "3–24 characters: lowercase letters, numbers, underscore.",
        className: "text-faint",
      };
    }
    if (availability && availability.forUsername === usernameCandidate) {
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
        text: "Availability will be confirmed when you submit.",
        className: "text-faint",
      };
    }
    return { text: "Checking availability…", className: "text-faint" };
  })();

  const copy = COPY[mode];
  const showTabs = mode !== "reset";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="auth-overlay absolute inset-0 bg-night/75 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="soft-frame soft-frame-accent auth-pop relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-hairline/80 bg-surface-raised/85 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-56 -translate-x-1/2 rounded-full bg-accent/25 blur-3xl"
        />

        <button
          type="button"
          data-auth-close="true"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-hairline text-muted transition-colors hover:border-hairline-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          >
            <path d="m4 4 8 8M12 4l-8 8" />
          </svg>
        </button>

        <header className="relative shrink-0 px-6 pt-6 sm:px-8 sm:pt-7">
          <Logo className="h-5 w-auto" />

          <h2
            id="auth-modal-title"
            className="mt-4 text-balance text-2xl font-semibold tracking-tight text-ink"
          >
            {copy.title}
          </h2>
          <p className="mt-2 text-sm text-muted">{copy.subtitle}</p>

          {showTabs ? (
            <div
              role="tablist"
              aria-label="Authentication mode"
              className="mt-5 grid grid-cols-2 gap-1 rounded-full border border-hairline bg-night/50 p-1"
            >
              {(["signin", "signup"] as const).map((value) => {
                const selected = mode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => switchMode(value)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      selected
                        ? "bg-accent text-night"
                        : "text-muted hover:text-ink"
                    }`}
                  >
                    {value === "signin" ? "Sign in" : "Sign up"}
                  </button>
                );
              })}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => switchMode("signin")}
              className="mt-5 inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 3.5 5.5 8l4.5 4.5" />
              </svg>
              Back to sign in
            </button>
          )}
        </header>

        <div className="scrollbar-none relative flex-1 overflow-y-auto overscroll-contain px-6 pb-6 pt-6 sm:px-8 sm:pb-8">
          {showTabs ? (
            <>
              <a
                href={`/auth/oauth?provider=google&next=${encodeURIComponent(
                  DEFAULT_AUTH_REDIRECT,
                )}`}
                onClick={markAppSession}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-hairline bg-surface px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-hairline-strong hover:bg-surface-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <GoogleIcon />
                Continue with Google
              </a>

              <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-widest text-faint">
                <span className="h-px flex-1 bg-hairline" />
                or
                <span className="h-px flex-1 bg-hairline" />
              </div>
            </>
          ) : null}

          {mode === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-4" noValidate>
              <TextField
                id="auth-identifier"
                label="Username or email"
                value={identifier}
                onChange={setIdentifier}
                autoComplete="username"
                required
                icon={<UserIcon />}
                placeholder="trader_01 or you@example.com"
              />

              <PasswordField
                id="auth-password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
                placeholder="Your password"
              />

              <button
                type="button"
                onClick={() => switchMode("reset")}
                className="-mt-1 self-start text-xs text-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                Forgot password?
              </button>

              <AuthSubmitButton
                loading={loading}
                label="Sign in"
                pendingLabel="Signing in…"
              />
            </form>
          ) : null}

          {mode === "signup" ? (
            <form onSubmit={handleSignUp} className="space-y-4" noValidate>
              <TextField
                id="auth-display-name"
                label={
                  <>
                    Full name <span className="text-faint">(optional)</span>
                  </>
                }
                value={displayName}
                onChange={setDisplayName}
                autoComplete="name"
                icon={<UserIcon />}
                placeholder="Alex Trader"
              />

              <TextField
                id="auth-username"
                label="Username"
                value={username}
                onChange={setUsername}
                autoComplete="username"
                required
                icon={<UserIcon />}
                placeholder="trader_01"
                hint={usernameHint.text}
                hintClassName={usernameHint.className}
              />

              <TextField
                id="auth-email"
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                icon={<MailIcon />}
                placeholder="you@example.com"
                hint="Kept private. Never shown to other users."
              />

              <PasswordField
                id="auth-new-password"
                label="Password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                strength
              />

              <AuthSubmitButton
                loading={loading}
                label="Create account"
                pendingLabel="Creating account…"
              />
            </form>
          ) : null}

          {mode === "reset" ? (
            <form onSubmit={handleReset} className="space-y-4" noValidate>
              <TextField
                id="auth-reset-email"
                label="Email"
                value={email}
                onChange={setEmail}
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                icon={<MailIcon />}
                placeholder="you@example.com"
              />

              <AuthSubmitButton
                loading={loading}
                label="Send reset link"
                pendingLabel="Sending…"
              />
            </form>
          ) : null}

          {error ? <Message tone="error">{error}</Message> : null}
          {notice ? <Message tone="success">{notice}</Message> : null}

          <p className="mt-6 text-center text-xs text-faint">
            By continuing you agree to Edgefolio&apos;s terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 18 18" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
