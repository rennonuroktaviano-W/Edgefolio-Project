import { isRateLimited, clientIp } from "@/lib/auth/rate-limit";
import { getMarketData } from "@/lib/market/provider";

// Backs the Explore "Market Pulse" refresh. The provider API key is read in a
// server-only module, so it never reaches the browser. The upstream fetch is
// cached for 60s, so repeated client polls do not amplify provider usage.

export async function GET(request: Request) {
  if (isRateLimited(`market-pulse:${clientIp(request)}`, 30, 60_000)) {
    return Response.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 },
    );
  }

  const result = await getMarketData();

  if (result.status === "ok") {
    return Response.json(
      { snapshot: result.snapshot },
      {
        headers: {
          "cache-control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      },
    );
  }

  return Response.json(
    {
      status: result.status,
      error:
        result.status === "unconfigured"
          ? "Market data is not connected."
          : result.message,
    },
    { status: 503 },
  );
}
