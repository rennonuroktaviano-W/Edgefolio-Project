import "server-only";

import { cache } from "react";
import { io } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
  username: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

type ProfileRow = {
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

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

  const { data } = await supabase
    .from("profiles")
    .select("username, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const profile = (data as ProfileRow | null) ?? null;

  return {
    id: user.id,
    email: user.email ?? null,
    username: profile?.username ?? null,
    displayName: profile?.display_name ?? null,
    avatarUrl: profile?.avatar_url ?? null,
  };
});
