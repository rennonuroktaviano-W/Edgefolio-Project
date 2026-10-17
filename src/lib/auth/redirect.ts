// Single source of truth for where users land after authenticating.
export const DEFAULT_AUTH_REDIRECT = "/explore";

// Only allow same-origin, absolute paths for post-auth redirects.
export function safeNextPath(
  value: string | null,
  fallback = DEFAULT_AUTH_REDIRECT,
): string {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }

  return value;
}
