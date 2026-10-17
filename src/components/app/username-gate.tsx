"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { UsernameForm } from "@/components/app/username-form";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function UsernameGate() {
  const panelRef = useRef<HTMLElement>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const triggerAttention = useCallback(() => {
    const panel = panelRef.current;
    if (panel) {
      panel.classList.remove("onboarding-attention");
      void panel.offsetWidth;
      panel.classList.add("onboarding-attention");
    }

    setNotice("Isi username dulu untuk lanjut ke dashboard.");

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    timerRef.current = window.setTimeout(() => {
      panelRef.current?.classList.remove("onboarding-attention");
      setNotice(null);
    }, 2400);
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("input")?.focus();
    }, 20);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        triggerAttention();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusables =
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
      if (!focusables || focusables.length === 0) {
        return;
      }

      const list = Array.from(focusables);
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? panelRef.current?.contains(active) : false;

      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!inside || active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [triggerAttention]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        aria-hidden="true"
        onPointerDown={triggerAttention}
        className="auth-overlay absolute inset-0 cursor-not-allowed bg-night/75 backdrop-blur-sm"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choose your username"
        className="auth-pop relative z-10 w-full max-w-md"
      >
        <UsernameForm panelRef={panelRef} />
        {notice ? (
          <p
            role="status"
            className="auth-msg-in mt-3 text-center text-sm font-medium text-warning"
          >
            {notice}
          </p>
        ) : null}
      </div>
    </div>
  );
}
