import type { NextRequest } from "next/server";

// Absolute origin used for auth redirects. A configured site URL wins so custom
// domains and proxied deployments stay stable; otherwise fall back to the
// origin of the incoming request. Trailing slashes are trimmed so redirect
// targets never end up with a double slash.
export function resolveSiteOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  return new URL(request.url).origin;
}
