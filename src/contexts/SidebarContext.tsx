"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

interface SidebarContextValue {
  /** Desktop (lg+): expanded rail vs. icon-only rail. */
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Below lg the sidebar is an off-canvas drawer; this is whether it is showing. */
  isMobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  toggleMobile: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Stable identities so consumers can list these in effect deps (e.g. close-on-route-change)
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const openMobile = useCallback(() => setIsMobileOpen(true), []);
  const closeMobile = useCallback(() => setIsMobileOpen(false), []);
  const toggleMobile = useCallback(() => setIsMobileOpen((prev) => !prev), []);

  const value = useMemo<SidebarContextValue>(
    () => ({ isOpen, open, close, toggle, isMobileOpen, openMobile, closeMobile, toggleMobile }),
    [isOpen, open, close, toggle, isMobileOpen, openMobile, closeMobile, toggleMobile],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
