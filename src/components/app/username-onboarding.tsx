import { getCurrentUser } from "@/lib/auth/dal";
import { UsernameForm } from "@/components/app/username-form";

// Server component: renders the one-time username picker until the signed-in
// user has claimed a username. Callers must render it behind a <Suspense>
// boundary because getCurrentUser reads cookies (cacheComponents enabled).
export async function UsernameOnboarding() {
  const user = await getCurrentUser();

  if (!user || user.username) {
    return null;
  }

  return <UsernameForm />;
}
