"use client";

import { useEffect } from "react";
import { useAuthModal } from "@/components/auth/auth-provider";

// The server already knows whether the visitor is signed in (see AccountChip).
// This bridges that server-known state into the client auth context so widgets
// like CtaButton can react without reading cookies on the client. It renders
// inside the AccountChip <Suspense> boundary, keeping the static shell intact.
export function AuthStateBridge({ authenticated }: { authenticated: boolean }) {
  const { setAuthenticated } = useAuthModal();

  useEffect(() => {
    setAuthenticated(authenticated);
  }, [authenticated, setAuthenticated]);

  return null;
}
