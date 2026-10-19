import { ViewTransition } from "react";
import type { ReactNode } from "react";

const ROUTE_MOTION = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
} as const;

export default function AppTemplate({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={ROUTE_MOTION} exit={ROUTE_MOTION} default="none">
      {children}
    </ViewTransition>
  );
}
