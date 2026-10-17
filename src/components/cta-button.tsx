"use client";

import Link from "next/link";
import { useAuthModal } from "@/components/auth/auth-provider";
import { siteConfig } from "@/config/site";
import { DEFAULT_AUTH_REDIRECT } from "@/lib/auth/redirect";

const ctaClasses =
  "btn-cta inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-night transition-colors duration-200 hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:bg-accent-strong";

function Shine() {
  return <span aria-hidden="true" className="btn-shine" />;
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="btn-arrow h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 8h9" />
      <path d="m8.5 4.5 3.5 3.5-3.5 3.5" />
    </svg>
  );
}

export function CtaButton() {
  const { openAuth, isAuthenticated } = useAuthModal();

  if (siteConfig.cta.href) {
    return (
      <a href={siteConfig.cta.href} className={ctaClasses}>
        <Shine />
        {siteConfig.cta.label}
        <ArrowIcon />
      </a>
    );
  }

  if (isAuthenticated) {
    return (
      <Link href={DEFAULT_AUTH_REDIRECT} className={ctaClasses}>
        <Shine />
        Open Dashboard
        <ArrowIcon />
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={ctaClasses}
      onClick={() => openAuth("signup")}
    >
      <Shine />
      {siteConfig.cta.label}
      <ArrowIcon />
    </button>
  );
}
