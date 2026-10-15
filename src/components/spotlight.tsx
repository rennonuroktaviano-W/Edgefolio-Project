"use client";

import { useRef } from "react";
import type { MouseEvent, ReactNode } from "react";

type SpotlightProps = {
  children: ReactNode;
  className?: string;
};

export function Spotlight({ children, className = "" }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--y", `${event.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onMouseMove={handlePointerMove} className={`spotlight ${className}`}>
      {children}
    </div>
  );
}
