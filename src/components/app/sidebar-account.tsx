import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/dal";
import { SidebarAccountMenu } from "@/components/app/sidebar-account-menu";

async function SidebarAccountContent() {
  const user = await getCurrentUser();

  return (
    <SidebarAccountMenu
      user={
        user
          ? { username: user.username, email: user.email }
          : null
      }
    />
  );
}

function AccountFallback() {
  return (
    <div
      aria-hidden="true"
      className="h-11 w-full animate-pulse rounded-xl border border-hairline bg-surface/60 lg:h-[38px]"
    />
  );
}

export function SidebarAccount() {
  return (
    <Suspense fallback={<AccountFallback />}>
      <SidebarAccountContent />
    </Suspense>
  );
}
