"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/layout/UserProfile";
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
    <header className="relative z-[60] flex h-[66px] items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 shadow-sm md:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          // Below lg the sidebar is an off-canvas drawer; on desktop the button collapses the rail
          onClick={() => (window.matchMedia("(min-width: 1024px)").matches ? toggle() : toggleMobile())}
          aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-expanded={isOpen}
          className="-ml-2 flex h-10 w-10 flex-col items-start justify-center gap-[5px] rounded-lg px-2.5 text-[#1a2b3c] transition-colors duration-200 hover:bg-[#F1F5F9] hover:text-brand-green active:scale-95"
        >
          <span className="block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-in-out" />
          <span className={cn("block h-[2px] rounded-full bg-current transition-all duration-300 ease-in-out", isOpen ? "w-5" : "w-3")} />
          <span className="block h-[2px] w-5 rounded-full bg-current transition-all duration-300 ease-in-out" />
        </button>
        <span className="truncate text-[15px] font-medium text-[#1a2b3c]">{pageTitle}</span>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {/* Search */}
        <div className="relative hidden lg:block cursor-text" onClick={() => setIsSearchOpen(true)}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="h-4 w-4 text-[#64748b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            readOnly
            placeholder="Search portal..."
            className="pointer-events-none h-9 w-[220px] cursor-text rounded-lg border border-zinc-200 bg-[#F8FAFC] pl-9 pr-4 text-sm text-[#4a5568] placeholder:text-[#64748b] focus:outline-none"
          />
        </div>
        
        {/* Search (icon only below lg) */}
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          aria-label="Search portal"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#4a5568] transition-colors hover:bg-zinc-100 lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

        {/* Device sync queue (FR-08) — pending count links to /sync */}
        <Link
          href="/sync"
          aria-label="Sync queue — 5 items awaiting sync"
          title="Sync queue"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#4a5568] transition-colors hover:bg-zinc-100"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
          </svg>
          <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#D97706] text-[11px] font-bold text-white">5</span>
        </Link>

        {/* Notifications */}
        <button 
          onClick={() => setIsNotificationsOpen(true)}
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8FAFC] text-[#4a5568] transition-colors hover:bg-zinc-100"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-[#DC2626] text-[11px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <NotificationsPanel
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkRead={(id) => setNotifications((list) => list.map((n) => (n.id === id ? { ...n, isUnread: false } : n)))}
          onMarkAllRead={() => setNotifications((list) => list.map((n) => ({ ...n, isUnread: false })))}
        />

        {/* User Profile */}
        <UserProfile />
      </div>
    </header>
  );
}
