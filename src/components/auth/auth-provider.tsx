"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AuthModal, type AuthMode } from "@/components/auth/auth-modal";

type AuthModalContextValue = {
  openAuth: (mode?: AuthMode) => void;
  isAuthenticated: boolean;
  setAuthenticated: (authenticated: boolean) => void;
};

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function useAuthModal(): AuthModalContextValue {
  const context = useContext(AuthModalContext);
  if (!context) {
    throw new Error("useAuthModal must be used within <AuthProvider>");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signin");
  const [instanceKey, setInstanceKey] = useState(0);
  const [isAuthenticated, setAuthenticated] = useState(false);

  const openAuth = useCallback((nextMode: AuthMode = "signin") => {
    setMode(nextMode);
    setInstanceKey((value) => value + 1);
    setOpen(true);
  }, []);

  const closeAuth = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openAuth, isAuthenticated, setAuthenticated }),
    [openAuth, isAuthenticated],
  );

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      {open ? (
        <AuthModal key={instanceKey} initialMode={mode} onClose={closeAuth} />
      ) : null}
    </AuthModalContext.Provider>
  );
}
