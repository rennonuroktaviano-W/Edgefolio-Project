import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { OpenAuthButton } from "@/components/auth/open-auth-button";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata = {
  title: "Reset password — Edgefolio",
  description: "Choose a new password for your Edgefolio account.",
};

async function ResetContent() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mt-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight text-ink">
          This link is no longer valid
        </h1>
        <p className="mt-3 text-sm text-muted">
          Your reset link may have expired or already been used. Request a new
          one from the sign-in dialog.
        </p>
        <div className="mt-6">
          <OpenAuthButton mode="reset">Request a new link</OpenAuthButton>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
        Set a new password
      </h1>
      <p className="mt-2 text-sm text-muted">
        You&apos;re resetting the password for{" "}
        <span className="text-ink">{user.email ?? "your account"}</span>.
      </p>
      <ResetPasswordForm />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-6 py-16">
      <div
        aria-hidden="true"
        className="bg-ambient pointer-events-none fixed inset-0 -z-50"
      />
      <div className="soft-frame w-full max-w-md rounded-3xl border border-hairline/70 bg-surface-raised/70 p-8 backdrop-blur-xl">
        <Logo className="h-8 w-auto" />
        <Suspense
          fallback={
            <p className="mt-6 text-sm text-muted" aria-live="polite">
              Checking your link…
            </p>
          }
        >
          <ResetContent />
        </Suspense>
        <p className="mt-8 text-center text-sm text-muted">
          <Link
            href="/"
            className="underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Back to home
          </Link>
        </p>
      </div>
    </main>
  );
}
