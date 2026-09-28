"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { ROLE_LABELS } from "@/lib/rbac";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function UserProfile() {
  const router = useRouter();
  const { user, role, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const name = user?.name ?? "Tadesse Alemu";
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout is only performed after the user confirms in the dialog
  const handleLogout = () => {
    setIsConfirmingLogout(false);
    logout();
    router.push("/login");
  };

  return (
    <div className="relative w-fit" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 py-1 pl-1 pr-3.5 border transition-colors duration-200 bg-white group active:scale-[0.98] w-full ${isOpen ? 'rounded-t-[20px] rounded-b-none border-zinc-200 border-b-transparent shadow-[0_-4px_10px_-5px_rgba(0,0,0,0.05)] relative z-[61]' : 'rounded-full border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
          }`}
      >
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-gold text-[13px] font-bold text-[#05392A] shadow-inner">
          {/* The portal ships a photo for the DA only; every other signed-in role falls back to initials. */}
          {role === "DA" ? (
            <img
              src="/images/tadesse_profile.png"
              alt="Profile"
              className="w-full h-full object-cover group-hover:scale-[1.3] group-hover:rotate-12 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            />
          ) : (
            initials
          )}
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-[14px] font-semibold leading-tight text-[#1a2b3c]">
            {name}
          </p>
          <p className="mt-0.5 text-[12.5px] leading-tight text-[#64748b]">
            {ROLE_LABELS[role]}
          </p>
        </div>
        <svg className={`w-4 h-4 text-[#1a2b3c] ml-1.5 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isOpen ? 'rotate-180' : 'group-hover:translate-y-[2px]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-0 w-full min-w-[200px] bg-white rounded-b-[20px] max-sm:rounded-tl-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-t-0 border-zinc-200 pt-0 pb-1.5 z-[60] animate-in fade-in duration-200">
          <div className="h-[1px] bg-zinc-200 w-full mb-1.5" />
          <Link
            href="/profile"
            onClick={() => setIsOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-[#F8FAFC] transition-colors text-left group"
          >
            <svg className="w-[22px] h-[22px] text-[#1a2b3c] transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="font-medium text-[14px] text-[#4a5568] group-hover:text-[#1a2b3c] transition-colors">My profile</span>
          </Link>

          <div className="h-[1px] bg-[#F1F3F4] my-1.5 mx-0" />

          <button
            onClick={() => { setIsOpen(false); setIsConfirmingLogout(true); }}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors text-left group"
          >
            <svg className="w-[22px] h-[22px] text-[#ef4444] group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium text-[14px] text-[#ef4444]">Logout</span>
          </button>
        </div>
      )}

      <Modal
        isOpen={isConfirmingLogout}
        onClose={() => setIsConfirmingLogout(false)}
        title="Log out?"
        icon={
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEECEC] text-[#DC2626]">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </span>
        }
        footer={
          <>
            <Button type="button" variant="outline" className="h-10 rounded-lg px-5 font-semibold" onClick={() => setIsConfirmingLogout(false)}>
              Cancel
            </Button>
            <Button type="button" className="h-10 rounded-lg bg-[#DC2626] px-5 font-semibold text-white hover:bg-[#B91C1C]" onClick={handleLogout} autoFocus>
              Yes, log out
            </Button>
          </>
        }
      >
        <p className="text-[14px] leading-relaxed text-[#4a5568]">
          Are you sure you want to log out of the Ethiopia Agent Portal? Any unsynced offline changes stay on this device
          and will sync the next time you sign in.
        </p>
      </Modal>
    </div>
  );
}
