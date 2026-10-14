"use client";

import { useState } from "react";
import { siteConfig } from "@/config/site";

const ctaClasses =
  "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-base font-semibold text-night transition-colors duration-200 hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink active:bg-accent-strong";

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-4 w-4"
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
  const [notice, setNotice] = useState(false);

  if (siteConfig.cta.href) {
    return (
      <a href={siteConfig.cta.href} className={ctaClasses}>
        {siteConfig.cta.label}
        <ArrowIcon />
      </a>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        className={ctaClasses}
        aria-describedby="cta-notice"
        onClick={() => setNotice(true)}
      >
        {siteConfig.cta.label}
        <ArrowIcon />
      </button>
      <p
        id="cta-notice"
        aria-live="polite"
        className="min-h-5 max-w-xs text-sm text-muted"
      >
        {notice
          ? "Thanks for the interest — Edgefolio is still in preview. The app is coming soon."
          : ""}
      </p>
    </div>
  );
}
