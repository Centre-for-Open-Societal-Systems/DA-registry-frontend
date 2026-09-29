"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { findAccount, type DemoAccount } from "@/features/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { FaydaSignInModal } from "./FaydaSignInModal";
import { ContactAdminModal } from "./ContactAdminModal";

export function LoginCard() {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isFaydaOpen, setIsFaydaOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // A live session skips the form — refreshing /login should not ask a signed-in agent to sign in again.
  useEffect(() => {
    if (hasHydrated && isAuthenticated) router.replace("/dashboard");
  }, [hasHydrated, isAuthenticated, router]);

  // No auth backend yet: the account list decides both identity and role (see features/auth/accounts).
  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const account = findAccount(String(form.get("email") ?? ""), String(form.get("password") ?? ""));

    if (!account) {
      setError("Email or password is incorrect. Check your credentials and try again.");
      return;
    }

    completeSignIn(account);
  };

  const completeSignIn = (account: DemoAccount) => {
    setError(null);
    signIn({ id: account.email, name: account.name, email: account.email }, account.role);
    router.push("/dashboard");
  };

  // Automatically clear URL query parameters if they exist
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return (
    <div className="group relative w-full max-w-[480px] transition-transform duration-500 ease-out hover:-translate-y-2">
      {/* SignInTab */}
      <div className="absolute -top-[32px] left-4 md:left-6 z-0 rounded-t-lg bg-brand-gold px-5 md:px-6 pt-2 pb-5 text-[13px] font-bold uppercase tracking-wider text-emerald-950 cursor-default">
        Agent Sign-In
      </div>

      <div className="relative z-10 flex flex-col gap-6 md:gap-8 rounded-[20px] bg-zinc-50 p-6 sm:p-8 md:p-10 shadow-2xl transition-shadow duration-500 ease-out group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)]">
        {/* LoginCardHeader */}
        <div className="flex flex-col items-center gap-4 md:gap-6 text-center">
          <div className="group flex cursor-default items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-green text-white transition-transform duration-500 ease-out group-hover:rotate-6 group-hover:scale-110">
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
            <h2 className="text-[22px] font-bold tracking-tight text-zinc-900">Sign in to your account</h2>
            <p className="mt-1 text-sm text-zinc-500">Enter your credentials to access the agent portal.</p>
          </div>
        </div>

        {/* LoginForm */}
        <form className="flex flex-col gap-4" onSubmit={handleLogin}>
          {error && <ErrorAlert message={error} />}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-zinc-700" htmlFor="email">Email address</label>
            <Input id="email" name="email" type="email" placeholder="Enter your email address" required className="bg-white transition-shadow duration-300 hover:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.1)]" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-zinc-700" htmlFor="password">Password</label>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              required
              className="bg-white transition-shadow duration-300 hover:border-emerald-400 focus:shadow-[0_0_0_3px_rgba(5,150,105,0.1)]"
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="text-zinc-400 transition-colors duration-300 hover:text-emerald-600 hover:scale-110 active:scale-95"
                >
                  {showPassword ? (
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
          </div>

          <div className="mt-1 flex items-center justify-between text-sm">
            <label className="group flex cursor-pointer items-center gap-2 font-medium text-zinc-700">
              <span className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  name="remember"
                  defaultChecked
                  className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded border-2 border-zinc-300 bg-white transition-all duration-300 checked:border-brand-green checked:bg-brand-green group-hover:border-emerald-500 group-hover:shadow-[0_0_0_4px_rgba(4,120,87,0.1)] group-active:scale-95"
                />
                <svg
                  className="pointer-events-none absolute h-3.5 w-3.5 scale-50 text-white opacity-0 transition-all duration-300 ease-out peer-checked:scale-100 peer-checked:opacity-100"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="transition-colors duration-300 group-hover:text-emerald-800">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setIsForgotPasswordOpen(true)}
              className="font-semibold text-brand-green transition-all duration-300 hover:text-brand-green-dark hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" variant="brand" size="lg" className="mt-2 h-11 w-full rounded-md transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]">
            <span className='font-semibold'>Sign in</span>
          </Button>

          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="h-px flex-1 bg-zinc-200" />
            or
            <span className="h-px flex-1 bg-zinc-200" />
          </div>

          <Button type="button" onClick={() => setIsFaydaOpen(true)} variant="brandOutline" size="lg" className="h-11 w-full gap-2 rounded-md transition-all duration-300 hover:bg-emerald-50 hover:scale-[1.02] active:scale-[0.98]">
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10h16v11H4V10zM8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4" />
            </svg>
            <span className='font-semibold'>Sign in with FAYDA ID</span>
          </Button>

          <p className="mt-1 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <button type="button" onClick={() => setIsContactOpen(true)} className="font-semibold text-brand-green transition-colors hover:text-brand-green-dark hover:underline">
              Contact your administrator.
            </button>
          </p>
          <p className="m-0 text-center text-xs text-slate-400">
            Ministry of Agriculture — Ethiopia
          </p>
        </form>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
      <FaydaSignInModal isOpen={isFaydaOpen} onClose={() => setIsFaydaOpen(false)} onSignedIn={completeSignIn} />
      <ContactAdminModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </div>
  );
}
