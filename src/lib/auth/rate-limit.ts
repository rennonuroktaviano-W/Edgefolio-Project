// Best-effort, per-instance rate limiter for the auth routes. It is not a
// substitute for a real edge/WAF limiter, but it makes rapid abuse of the
// sign-in and sign-up endpoints unappealing. State resets on redeploy.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function isRateLimited(
  key: string,
  limit: number,
  windowMs: number,
): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (bucket.count >= limit) {
    return true;
  }

  bucket.count += 1;
  return false;
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
