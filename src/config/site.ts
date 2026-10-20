export const siteConfig = {
  name: "Edgefolio",
  eyebrow: "TRADE LOG, REDEFINED",
  headline: "Your Trading Edge Starts Here.",
  description:
    "Track your trades, understand your performance, and make every decision more intentional.",
  cta: {
    label: "Get Started",
    // When unset, the CTA opens the auth modal (see CtaButton). Point this at
    // a dedicated route instead if the flow ever moves to its own page.
    href: null as string | null,
  },
} as const;

export type SiteConfig = typeof siteConfig;
