import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Browser client. Returns null when env vars are missing so the app keeps
// building and running (the landing page itself never needs Supabase).
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) {
    return null;
  }

  return createBrowserClient(supabaseUrl as string, supabaseAnonKey as string);
}
