"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "@/components/app/icons";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "md" | "lg";
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;

      const list = Array.from(focusables);
      const first = list[0];
      const last = list[list.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>("input, textarea, button")?.focus();
    }, 30);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="auth-overlay fixed inset-0 bg-night/75 backdrop-blur-sm"
      />
      <div className="relative flex min-h-full items-start justify-center p-4 sm:items-center sm:p-6">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={`auth-pop relative w-full ${
            size === "lg" ? "max-w-3xl" : "max-w-xl"
          } rounded-2xl border border-hairline bg-surface shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)]`}
        >
          <div className="flex items-start justify-between gap-4 border-b border-hairline p-5 sm:p-6">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold tracking-tight text-ink">
                {title}
              </h2>
              {description ? (
                <p className="mt-1 text-sm text-muted">{description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-muted transition-colors hover:bg-surface-strong hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="scrollbar-none max-h-[70vh] overflow-y-auto p-5 sm:p-6">
            {children}
          </div>

          {footer ? (
            <div className="border-t border-hairline p-5 sm:px-6 sm:py-4">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
