"use client";

import { useState } from "react";

function IconWrap({ children }: { children: React.ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-faint">
      {children}
    </span>
  );
}

export function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="7" r="3.2" />
      <path d="M4.5 16.5a5.5 5.5 0 0 1 11 0" />
    </svg>
  );
}

export function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" />
      <path d="m3.5 6 6.5 4.5L16.5 6" />
    </svg>
  );
}

export function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4.5" y="8.5" width="11" height="8" rx="2" />
      <path d="M7 8.5V6.5a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

export function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="mt-0.5 h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 6.5v4M10 13.4v.1" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="mt-0.5 h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="10" cy="10" r="7.5" />
      <path d="m6.6 10.2 2.2 2.2 4.4-4.4" />
    </svg>
  );
}

type TextFieldProps = {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  icon?: React.ReactNode;
  hint?: React.ReactNode;
  hintClassName?: string;
  inputMode?: "text" | "email";
};

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  required,
  icon,
  hint,
  hintClassName = "text-faint",
  inputMode,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        {icon ? <IconWrap>{icon}</IconWrap> : null}
        <input
          id={id}
          name={id}
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={`w-full rounded-xl border border-hairline bg-night/60 py-3 text-sm text-ink outline-none transition-all duration-150 placeholder:text-faint focus:border-accent/70 focus:bg-night/80 focus:ring-2 focus:ring-accent/20 ${
            icon ? "pl-10 pr-4" : "px-4"
          }`}
        />
      </div>
      {hint ? (
        <p className={`mt-1.5 text-xs ${hintClassName}`} aria-live="polite">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  strength?: boolean;
};

export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  strength = false,
}: PasswordFieldProps) {
  const [shown, setShown] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        <IconWrap>
          <LockIcon />
        </IconWrap>
        <input
          id={id}
          name={id}
          type={shown ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full rounded-xl border border-hairline bg-night/60 py-3 pl-10 pr-11 text-sm text-ink outline-none transition-all duration-150 placeholder:text-faint focus:border-accent/70 focus:bg-night/80 focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="button"
          onClick={() => setShown((value) => !value)}
          aria-label={shown ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-faint transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {shown ? (
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3l14 14" />
              <path d="M9.9 5.2A9.5 9.5 0 0 1 18 10a9.5 9.5 0 0 1-2.2 2.8M6.2 6.5A9.5 9.5 0 0 0 2 10a9.5 9.5 0 0 0 6.1 4c1 .1 2 .1 2.9-.1" />
              <path d="M8.5 8.6a2 2 0 0 0 2.9 2.9" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z" />
              <circle cx="10" cy="10" r="2" />
            </svg>
          )}
        </button>
      </div>
      {strength ? <PasswordStrength value={value} /> : null}
    </div>
  );
}

const STRENGTH_LEVELS = [
  { label: "Weak", bar: "bg-negative", text: "text-negative" },
  { label: "Fair", bar: "bg-warning", text: "text-warning" },
  { label: "Good", bar: "bg-info", text: "text-info" },
  { label: "Strong", bar: "bg-positive", text: "text-positive" },
];

export function passwordScore(value: string): number {
  if (!value) {
    return 0;
  }
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.max(1, Math.min(4, score));
}

export function PasswordStrength({ value }: { value: string }) {
  if (!value) {
    return null;
  }

  const score = passwordScore(value);
  const level = STRENGTH_LEVELS[score - 1];

  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4].map((segment) => (
          <span
            key={segment}
            className={`h-1 flex-1 rounded-full transition-colors ${
              segment <= score ? level.bar : "bg-hairline"
            }`}
          />
        ))}
      </div>
      <p className={`mt-1.5 text-xs ${level.text}`} aria-live="polite">
        Password strength: {level.label}
      </p>
    </div>
  );
}

type MessageProps = {
  tone: "error" | "success";
  children: React.ReactNode;
};

export function Message({ tone, children }: MessageProps) {
  const styles =
    tone === "error"
      ? "border-negative/40 bg-negative/10 text-negative"
      : "border-positive/40 bg-positive/10 text-positive";

  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`auth-msg-in mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm ${styles}`}
    >
      {tone === "error" ? <AlertIcon /> : <CheckIcon />}
      <span>{children}</span>
    </p>
  );
}

type AuthSubmitButtonProps = {
  loading: boolean;
  label: string;
  pendingLabel: string;
};

export function AuthSubmitButton({
  loading,
  label,
  pendingLabel,
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-night transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-night/40 border-t-night" />
      ) : null}
      {loading ? pendingLabel : label}
    </button>
  );
}
