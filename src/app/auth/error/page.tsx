import Link from "next/link";
import { Logo } from "@/components/logo";
import { OpenAuthButton } from "@/components/auth/open-auth-button";

export const metadata = {
  title: "Sign-in problem — Edgefolio",
  description: "We could not complete that sign-in attempt.",
};

export default function AuthErrorPage() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-6 py-16">
      <div
        aria-hidden="true"
        className="bg-ambient pointer-events-none fixed inset-0 -z-50"
      />
      <div className="soft-frame w-full max-w-md rounded-3xl border border-hairline/70 bg-surface-raised/70 p-8 text-center backdrop-blur-xl">
        <Logo className="mx-auto h-8 w-auto" />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
          Sign-in could not be completed
        </h1>
        <p className="mt-3 text-sm text-muted">
          The link may have expired or already been used. Please try signing in
          again.
        </p>
        <div className="mt-8 flex flex-col items-center gap-4">
          <OpenAuthButton mode="signin">Try again</OpenAuthButton>
          <Link
            href="/"
            className="text-sm text-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
