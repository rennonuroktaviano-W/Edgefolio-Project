import "server-only";

import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

// Privileged client that uses the service-role key. It must stay on the server
// and is only used to resolve a username to its email during sign-in.
// Returns null when the key is not configured, so username sign-in is simply
// unavailable instead of failing silently with the anon key.
export function createAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
