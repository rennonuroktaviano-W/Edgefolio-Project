import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { getCurrentUser } from "@/lib/auth/dal";

export const metadata = {
  title: "Your account — Edgefolio",
  description: "Manage your Edgefolio account.",
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-hairline py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-medium uppercase tracking-widest text-faint">
        {label}
      </span>
      <span className="break-all text-sm text-ink">{value}</span>
    </div>
  );
}

async function AccountContent() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div className="soft-frame w-full max-w-lg rounded-3xl border border-hairline/70 bg-surface-raised/70 p-8 backdrop-blur-xl">
      <Logo className="h-8 w-auto" />

      <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
        Your account
      </h1>
      <p className="mt-2 text-sm text-muted">
        You are signed in to Edgefolio.
      </p>

      <div className="mt-6">
        <DetailRow label="Username" value={user.username ?? "—"} />
        <DetailRow label="Email" value={user.email ?? "—"} />
        {user.displayName ? (
          <DetailRow label="Name" value={user.displayName} />
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <SignOutButton />
        <Link
          href="/"
          className="text-sm text-muted transition-colors hover:text-ink"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16">
      <div
        aria-hidden="true"
        className="bg-ambient pointer-events-none fixed inset-0 -z-50"
      />
      <Suspense
        fallback={
          <p className="text-sm text-muted" aria-live="polite">
            Loading your account…
          </p>
        }
      >
        <AccountContent />
      </Suspense>
    </div>
  );
}
