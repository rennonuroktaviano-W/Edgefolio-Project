import { Suspense } from "react";
import { AppShell } from "@/components/app/app-shell";
import { SidebarAccount } from "@/components/app/sidebar-account";
import { UsernameOnboarding } from "@/components/app/username-onboarding";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="bg-ambient pointer-events-none fixed inset-0 -z-50"
      />
      <AppShell account={<SidebarAccount />}>{children}</AppShell>

      <Suspense fallback={null}>
        <UsernameOnboarding />
      </Suspense>
    </div>
  );
}
