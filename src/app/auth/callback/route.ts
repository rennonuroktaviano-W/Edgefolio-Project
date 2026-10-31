import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { resolveSiteOrigin } from "@/lib/auth/origin";
import { safeNextPath } from "@/lib/auth/redirect";

// OAuth (Google) and email links that carry a `code` land here.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = resolveSiteOrigin(request);
  const code = searchParams.get("code");
  const next = safeNextPath(searchParams.get("next"));
  const errorCode = searchParams.get("error_code") ?? searchParams.get("error");

  if (errorCode) {
    return NextResponse.redirect(
      `${origin}/auth/error?reason=${encodeURIComponent(errorCode)}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
