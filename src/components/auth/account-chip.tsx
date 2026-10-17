import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/dal";
import { UserMenu } from "@/components/auth/user-menu";
import { AuthStateBridge } from "@/components/auth/auth-state-bridge";

async function AccountChipContent() {
  const user = await getCurrentUser();

  return (
    <>
      <AuthStateBridge authenticated={Boolean(user)} />
      {user ? (
        <div className="pointer-events-none fixed right-4 top-4 z-40">
          <div className="pointer-events-auto">
            <UserMenu username={user.username} email={user.email} />
          </div>
        </div>
      ) : null}
    </>
  );
}

// Reads the session cookie, so it lives behind a <Suspense> boundary to keep
// the static shell fast (required with cacheComponents enabled).
export function AccountChip() {
  return (
    <Suspense fallback={null}>
      <AccountChipContent />
    </Suspense>
  );
}
