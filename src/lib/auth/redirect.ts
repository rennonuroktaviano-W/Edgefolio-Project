// Only allow same-origin, absolute paths for post-auth redirects.
export function safeNextPath(value: string | null, fallback = "/account"): string {
  if (!value) {
    return fallback;
  }

  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }

  return value;
}
