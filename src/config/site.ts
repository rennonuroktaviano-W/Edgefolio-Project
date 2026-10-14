export const siteConfig = {
  name: "Edgefolio",
  eyebrow: "TRADING JOURNAL, REDEFINED",
  headline: "Your Trading Edge Starts Here.",
  description:
    "Track your trades, understand your performance, and make every decision more intentional.",
  cta: {
    label: "Get Started",
    // Frontend-only stage: no dashboard/auth route exists yet, so the CTA shows
    // an honest placeholder instead of linking to a fake page.
    // Set this to a real path (e.g. "/dashboard") once that route exists.
    href: null as string | null,
  },
} as const;

export type SiteConfig = typeof siteConfig;
