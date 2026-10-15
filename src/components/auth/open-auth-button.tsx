"use client";

import { useAuthModal } from "@/components/auth/auth-provider";
import type { AuthMode } from "@/components/auth/auth-modal";

type OpenAuthButtonProps = {
  mode?: AuthMode;
  children: React.ReactNode;
  className?: string;
};

const defaultClasses =
  "inline-flex items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-night transition-colors hover:bg-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";

export function OpenAuthButton({
  mode = "signin",
  children,
  className = defaultClasses,
}: OpenAuthButtonProps) {
  const { openAuth } = useAuthModal();

  return (
    <button type="button" onClick={() => openAuth(mode)} className={className}>
      {children}
    </button>
  );
}
