"use client";

import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/Input";

/** Input styling shared by the sign-in and register forms. */
export const AUTH_INPUT = "short:h-10 bg-white transition-shadow duration-300 hover:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(22,163,74,0.12)]";
export const AUTH_LABEL = "text-sm font-bold text-zinc-700";

interface AuthCardProps {
  /** Gold tab above the card, e.g. "Agent Sign-In". */
  tab: string;
  title: string;
  subtitle: string;
  /** Wider card for longer forms. */
  wide?: boolean;
  children: ReactNode;
}

// The floating card used by /login and /register: gold tab, OpenAgriNet mark, title and the form below.
export function AuthCard({ tab, title, subtitle, wide, children }: AuthCardProps) {
  // The entrance animation sits on its own wrapper: an animated transform would otherwise override the hover lift.
  return (
    <div className={`w-full animate-card-in ${wide ? "max-w-[560px]" : "max-w-[480px]"}`}>
    <div className="group relative w-full transition-transform duration-500 ease-out hover:-translate-y-2">
      <div className="absolute -top-[32px] left-4 md:left-6 z-0 rounded-t-lg bg-brand-gold px-4 sm:px-5 md:px-6 pt-2 pb-5 text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-emerald-950 cursor-default">
        {tab}
      </div>

      <div className="relative z-10 flex flex-col gap-5 md:gap-6 rounded-[20px] bg-zinc-50 p-5 sm:p-6 md:p-8 md:short:p-6 tiny:p-4 md:tiny:p-5 short:gap-4 md:short:gap-4 tiny:gap-3 md:tiny:gap-3 shadow-2xl transition-shadow duration-500 ease-out group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col items-center gap-3 md:gap-4 short:gap-2 md:short:gap-2 text-center">
          <div className="group flex cursor-default items-center justify-center gap-3">
            <div className="flex h-10 w-10 short:h-9 short:w-9 items-center justify-center rounded-lg bg-brand-green text-white transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110">
              <svg width="22" height="22" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_707_6903)">
                  <path d="M10.4993 7.152V5.25C10.4993 4.45435 10.8153 3.69129 11.3778 3.12868C11.9404 2.56607 12.7034 2.25 13.499 2.25H14.6238C14.7233 2.25 14.8187 2.28951 14.889 2.35984C14.9593 2.43016 14.9988 2.52554 14.9988 2.625V3.75C14.9988 4.54565 14.6828 5.30871 14.1202 5.87132C13.5577 6.43393 12.7947 6.75 11.9991 6.75C11.2035 6.75 10.4405 7.06607 9.87799 7.62868C9.31544 8.19129 8.9994 8.95435 8.9994 9.75M8.9994 9.75C8.9994 11.25 9.74933 12 9.74933 13.5C9.74933 14.3114 9.48618 15.1009 8.9994 15.75M8.9994 9.75C8.9994 9.05358 8.80549 8.37092 8.4394 7.77851C8.0733 7.1861 7.54949 6.70735 6.92666 6.3959C6.30382 6.08445 5.60657 5.95261 4.91304 6.01515C4.2195 6.0777 3.55708 6.33215 3 6.75C3 7.44642 3.19391 8.12908 3.56 8.72149C3.9261 9.3139 4.44991 9.79265 5.07274 10.1041C5.69558 10.4156 6.39283 10.5474 7.08636 10.4848C7.7799 10.4223 8.44232 10.1679 8.9994 9.75ZM3.74993 15.75H14.2489" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </g>
                <defs>
                  <clipPath id="clip0_707_6903">
                    <rect width="18" height="18" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div className="text-left">
              <p className="text-[10px] font-bold uppercase tracking-wider text-brand-green transition-colors duration-300 group-hover:text-brand-green-dark">Ethiopia Agent Portal</p>
              <p className="text-xl font-bold leading-tight text-zinc-900">OpenAgriNet</p>
            </div>
          </div>
          <div>
            <h2 className="text-[20px] sm:text-[22px] short:text-[19px] sm:short:text-[19px] font-bold tracking-tight text-zinc-900">{title}</h2>
            <p className="mt-1 text-sm text-zinc-500 tiny:hidden">{subtitle}</p>
          </div>
        </div>

        {children}
      </div>
    </div>
    </div>
  );
}

/** Password field with the show/hide eye toggle. */
export function PasswordInput({ id, name, placeholder = "••••••••", autoComplete }: { id: string; name: string; placeholder?: string; autoComplete?: string }) {
  const [show, setShow] = useState(false);
  return (
    <Input
      id={id}
      name={name}
      type={show ? "text" : "password"}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required
      className={AUTH_INPUT}
      startAdornment={
        <svg className="h-4 w-4 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 118 0v4" />
        </svg>
      }
      endAdornment={
        <button
          type="button"
          onClick={() => setShow((prev) => !prev)}
          aria-label={show ? "Hide password" : "Show password"}
          className="text-zinc-400 transition-colors duration-300 hover:text-emerald-600 hover:scale-110 active:scale-95"
        >
          {show ? (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.5 5.2A9.8 9.8 0 0112 5c5 0 9 4 10 7a12 12 0 01-3.1 4.2M6.6 6.6C4.3 8 2.8 10 2 12c1 3 5 7 10 7 1.3 0 2.5-.2 3.6-.6" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      }
    />
  );
}
