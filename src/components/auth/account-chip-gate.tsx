"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

const APP_PREFIXES = ["/explore"];

// The app shell provides its own account control, so the landing page's
// floating chip is hidden across app routes.
export function AccountChipGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const isAppRoute = APP_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isAppRoute) {
    return null;
  }

  return <>{children}</>;
}
