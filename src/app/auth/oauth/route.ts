import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/auth/redirect";

const PROVIDERS = ["google"] as const;
type SupportedProvider = (typeof PROVIDERS)[number];

function isSupportedProvider(value: string): value is SupportedProvider {
  return (PROVIDERS as readonly string[]).includes(value);
}

// Starts an OAuth sign-in through the server so a disabled/misconfigured
// provider shows the friendly /auth/error page instead of Supabase's raw JSON.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const provider = searchParams.get("provider") ?? "google";
  const next = safeNextPath(searchParams.get("next"));

  if (!isSupportedProvider(provider)) {
    return NextResponse.redirect(`${origin}/auth/error?reason=unsupported_provider`);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = await createClient();
  if (!supabase || !supabaseUrl || !supabaseAnonKey) {
    return NextResponse.redirect(`${origin}/auth/error?reason=not_configured`);
  }

  // The SDK builds the authorize URL locally, so probe the public settings to
  // detect a provider that has not been enabled in the dashboard yet.
  try {
    const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: { apikey: supabaseAnonKey },
      cache: "no-store",
    });

    if (settingsResponse.ok) {
      const settings = (await settingsResponse.json()) as {
        external?: Record<string, boolean>;
      };
      if (settings.external?.[provider] !== true) {
        return NextResponse.redirect(
          `${origin}/auth/error?reason=provider_disabled`,
        );
      }
    }
  } catch {
    // If the probe fails, fall through and let the provider redirect decide.
  }

  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
      queryParams: { prompt: "select_account" },
    },
  });

  if (error || !data?.url) {
    return NextResponse.redirect(`${origin}/auth/error?reason=oauth_unavailable`);
  }

  return NextResponse.redirect(data.url);
}
