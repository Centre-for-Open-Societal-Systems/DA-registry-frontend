"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/layout/UserProfile";
import { LanguageSelector } from "@/components/layout/LanguageSelector";
import { SearchModal } from "@/components/layout/SearchModal";
import { NOTIFICATIONS, NotificationsPanel } from "@/components/layout/NotificationsPanel";
import { pageTitleFor } from "@/lib/rbac";

export function Header() {
  const { toggle, isOpen, toggleMobile } = useSidebar();
  const pathname = usePathname();
  const pageTitle = pageTitleFor(pathname);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const unreadCount = notifications.filter((n) => n.isUnread).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="relative z-[60] flex h-16 items-center justify-between gap-3 bg-white px-4 shadow-md md:px-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          // Below lg the sidebar is an off-canvas drawer; on desktop the button collapses the rail
          onClick={() => (window.matchMedia("(min-width: 1024px)").matches ? toggle() : toggleMobile())}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isOpen}
          className="-ml-2 flex h-10 w-10 flex-col items-start justify-center gap-[5px] rounded-lg px-2.5 text-ink transition-colors duration-200 hover:bg-brand-green-bright hover:text-white active:scale-95"
        >
          <span className="block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-in-out" />
          <span className={cn("block h-[2px] rounded-full bg-current transition-all duration-300 ease-in-out", isOpen ? "w-5" : "w-3")} />
          <span className="block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-in-out" />
        </button>
        <h2 className="truncate text-[18px] font-bold tracking-tight text-ink sm:text-[22px]">{pageTitle}</h2>
      </div>

      {/* Right section — laid out like the Grievance Management portal header */}
      <div className="flex shrink-0 items-center gap-3 lg:gap-5">
        {/* Search */}
        <div className="relative hidden w-80 cursor-text lg:block xl:w-[400px]" onClick={() => setIsSearchOpen(true)}>
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <svg className="h-4 w-4 text-subtle" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            readOnly
            placeholder="Search portal..."
            className="pointer-events-none block w-full cursor-text rounded-lg border border-transparent bg-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        
        {/* Search (icon only below lg) */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Search portal"
          className="flex items-center justify-center text-slate-500 transition-colors hover:text-slate-700 lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        {/* Notifications */}
        <button
          type="button"
          onClick={() => setIsNotificationsOpen(true)}
          aria-label={unreadCount > 0 ? `Notifications — ${unreadCount} unread` : "Notifications"}
          className="relative text-slate-500 transition-colors hover:text-slate-700 focus:outline-none lg:ml-2"
        >
          <svg className="h-[22px] w-[22px]" fill="currentColor" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path fill="none" d="M10.3 21a1.94 1.94 0 003.4 0" />
          </svg>
          {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 block h-2.5 w-2.5 rounded-full border-2 border-white bg-red-600" />}
        </button>

        <NotificationsPanel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkRead={(id) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, isUnread: false } : n)))}
          onMarkAllRead={() => setNotifications((list) => list.map((n) => ({ ...n, isUnread: false })))}
        />

        {/* Vertical divider */}
        <div className="mx-1 hidden h-7 w-px bg-zinc-200 md:block" />

        <LanguageSelector className="hidden md:block" />

        {/* User Profile */}
        <UserProfile />
      </div>
    </header>
  );
}
