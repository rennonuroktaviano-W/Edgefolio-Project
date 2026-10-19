import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center">
      <div
        aria-hidden="true"
        className="bg-ambient pointer-events-none fixed inset-0 -z-50"
      />
      <Logo priority className="h-9 w-auto" />
      <p className="mt-10 text-xs font-semibold tracking-[0.28em] text-accent sm:text-sm">
        404
      </p>
      <h1 className="mt-5 text-balance text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-4 max-w-md text-pretty text-base leading-8 text-muted">
        The link may be broken or the page may have moved. Head back to the
        home page to continue.
      </p>
      <Link
        href="/"
        className="btn-cta mt-10 inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-night transition-colors duration-200 hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:bg-accent-strong"
      >
        Back to home
      </Link>
    </main>
  );
}
