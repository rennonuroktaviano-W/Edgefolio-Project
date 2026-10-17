import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

// Usernames live in the auth user's `user_metadata`, so there is no separate
// table to create. This keeps the feature working with just the service-role
// key. It scans the user list, which is fine for a small user base; a database
// table with a unique index would be the next step at scale.

export function readUsername(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  const value = metadata?.username;
  return typeof value === "string" && value.length > 0 ? value : null;
}

export type UsernameLookup =
  | { status: "found"; id: string; email: string | null }
  | { status: "missing" }
  | { status: "unavailable" };

function matchUsername(
  metadata: Record<string, unknown> | undefined,
  username: string,
): boolean {
  const value = metadata?.username;
  return typeof value === "string" && value.toLowerCase() === username;
}

export async function findUserByUsername(
  username: string,
): Promise<UsernameLookup> {
  const admin = createAdminClient();
  if (!admin) {
    return { status: "unavailable" };
  }

  const perPage = 1000;
  const maxPages = 100;

  for (let page = 1; page <= maxPages; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      return { status: "unavailable" };
    }

    const users = data.users ?? [];
    const match = users.find((user) => matchUsername(user.user_metadata, username));

    if (match) {
      return { status: "found", id: match.id, email: match.email ?? null };
    }

    if (users.length === 0) {
      break;
    }
  }

  return { status: "missing" };
}
