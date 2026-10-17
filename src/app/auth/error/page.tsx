import { Suspense } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { OpenAuthButton } from "@/components/auth/open-auth-button";

export const metadata = {
  title: "Sign-in problem — Edgefolio",
  description: "We could not complete that sign-in attempt.",
};

type Reason = { title: string; body: string };

const REASONS: Record<string, Reason> = {
  provider_disabled: {
    title: "Google sign-in isn't available yet",
    body: "Google sign-in has not been set up for this site. Use your username or email to sign in instead.",
  },
  oauth_unavailable: {
    title: "Google sign-in isn't available yet",
    body: "We could not start Google sign-in. Please try again, or sign in with your username or email.",
  },
  unsupported_provider: {
    title: "Unsupported sign-in method",
    body: "That sign-in option is not supported. Please sign in with your username or email.",
  },
  not_configured: {
    title: "Sign-in isn't configured yet",
    body: "Authentication is not available right now. Please try again later.",
  },
  access_denied: {
    title: "Sign-in was cancelled",
    body: "You cancelled the sign-in attempt before it finished. You can try again whenever you're ready.",
  },
};

const FALLBACK: Reason = {
  title: "Sign-in could not be completed",
  body: "The link may have expired or already been used. Please try signing in again.",
};

async function ErrorReason({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const content = (reason ? REASONS[reason] : undefined) ?? FALLBACK;

  return (
    <>
      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
        {content.title}
      </h1>
      <p className="mt-3 text-sm text-muted">{content.body}</p>
    </>
  );
}

export default function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-6 py-16">
      <div
        aria-hidden="true"
        className="bg-ambient pointer-events-none fixed inset-0 -z-50"
      />
      <div className="soft-frame w-full max-w-md rounded-3xl border border-hairline/70 bg-surface-raised/70 p-8 text-center backdrop-blur-xl">
        <Logo className="mx-auto h-8 w-auto" />
        <Suspense
          fallback={
            <>
              <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
                Sign-in problem
              </h1>
              <p className="mt-3 text-sm text-muted">
                Checking what happened…
              </p>
            </>
          }
        >
          <ErrorReason searchParams={searchParams} />
        </Suspense>
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
