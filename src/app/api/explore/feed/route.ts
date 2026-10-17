import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  EXPLORE_DEFAULT_LIMIT,
  listRecapsPage,
  type ExploreSort,
} from "@/lib/recaps/queries";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const sortParam = searchParams.get("sort");
  const sort: ExploreSort = sortParam === "discussed" ? "discussed" : "latest";

  const rawSymbol = searchParams.get("symbol");
  const symbol = rawSymbol && rawSymbol !== "all" ? rawSymbol : null;

  const rawOffset = Number.parseInt(searchParams.get("offset") ?? "0", 10);
  const rawLimit = Number.parseInt(
    searchParams.get("limit") ?? String(EXPLORE_DEFAULT_LIMIT),
    10,
  );

  const page = await listRecapsPage({
    sort,
    symbol,
    offset: Number.isFinite(rawOffset) ? rawOffset : 0,
    limit: Number.isFinite(rawLimit) ? rawLimit : EXPLORE_DEFAULT_LIMIT,
  });

  return NextResponse.json(page);
}
