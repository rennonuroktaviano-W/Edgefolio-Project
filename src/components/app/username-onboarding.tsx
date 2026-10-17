import { getCurrentUser } from "@/lib/auth/dal";
import { UsernameGate } from "@/components/app/username-gate";

// Server component: renders the blocking username gate until the signed-in
// user has claimed a username. Callers must render it behind a <Suspense>
// boundary because getCurrentUser reads cookies (cacheComponents enabled).
export async function UsernameOnboarding() {
  const user = await getCurrentUser();

  if (!user || user.username) {
    return null;
  }

  return <UsernameGate />;
}
