"use client";

import { createContext, useContext } from "react";

export const SidebarCollapseContext = createContext(false);

export function useSidebarCollapsed(): boolean {
  return useContext(SidebarCollapseContext);
}
