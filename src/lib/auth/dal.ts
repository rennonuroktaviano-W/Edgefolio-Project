import "server-only";

import { cache } from "react";
import { io } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { readUsername } from "@/lib/auth/user-lookup";

export type CurrentUser = {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

function readString(
  metadata: Record<string, unknown>,
  key: string,
): string | null {
  const value = metadata[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

// Data Access Layer. Callers must render it behind a <Suspense> boundary
// because it reads cookies (required with cacheComponents enabled).
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // Suspend prerendering before Supabase reads the session, so the library's
  // internal token-expiry `Date.now()` check runs at request time instead of
  // during static shell generation (required with cacheComponents enabled).
  await io();

  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    id: user.id,
    email: user.email ?? null,
    username: readUsername(metadata),
    displayName:
      readString(metadata, "display_name") ??
      readString(metadata, "full_name") ??
      readString(metadata, "name"),
    avatarUrl: readString(metadata, "avatar_url"),
  };
});
