"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorAlert } from "@/components/ui/ErrorAlert";
import { findAccount, useRegisteredAccountsStore, type DemoAccount } from "@/features/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { AUTH_INPUT, AUTH_LABEL, AuthCard, PasswordInput } from "../../components/AuthCard";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { ContactAdminModal } from "./ContactAdminModal";

export function LoginCard() {
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const registeredAccounts = useRegisteredAccountsStore((s) => s.accounts);
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
    const account = findAccount(String(form.get("email") ?? ""), String(form.get("password") ?? ""), registeredAccounts);

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
    <>
      <AuthCard tab="Agent Sign-In" title="Sign in to your account" subtitle="Enter your credentials to access the agent portal.">
        <form className="flex flex-col gap-4 short:gap-3" onSubmit={handleLogin}>
          {error && <ErrorAlert message={error} />}

          <div className="flex flex-col gap-1.5">
            <label className={AUTH_LABEL} htmlFor="email">Email address</label>
            <Input id="email" name="email" type="email" placeholder="Enter your email address" required className={AUTH_INPUT} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className={AUTH_LABEL} htmlFor="password">Password</label>
            <PasswordInput id="password" name="password" />
          </div>

          <div className="mt-1 flex items-center justify-between text-sm">
            <label className="group flex cursor-pointer items-center gap-2 font-medium text-zinc-700">
              <span className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  name="remember"
                  defaultChecked
                  className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded border-2 border-zinc-300 bg-white transition-all duration-300 checked:border-brand-green checked:bg-brand-green group-hover:border-emerald-500 group-hover:shadow-[0_0_0_4px_rgba(22,163,74,0.12)] group-active:scale-95"
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

          <Button type="submit" variant="brand" size="lg" className="mt-2 short:mt-1 h-11 short:h-10 w-full rounded-md transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]">
            <span className='font-semibold'>Sign in</span>
          </Button>

          <div className="flex items-center gap-3 text-sm text-zinc-400">
            <span className="h-px flex-1 bg-zinc-200" />
            or
            <span className="h-px flex-1 bg-zinc-200" />
          </div>

          <Link
            href="/register"
            className="inline-flex h-11 short:h-10 w-full items-center justify-center rounded-md border border-brand-green bg-white text-brand-green transition-all duration-300 hover:bg-emerald-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <span className="font-semibold">Register</span>
          </Link>

          <p className="mt-1 text-center text-sm text-zinc-500">
            Need help?{" "}
            <button type="button" onClick={() => setIsContactOpen(true)} className="font-semibold text-brand-green transition-colors hover:text-brand-green-dark hover:underline">
              Contact your administrator.
            </button>
          </p>
          <p className="m-0 text-center text-xs text-slate-400">
            Ministry of Agriculture — Ethiopia
          </p>
        </form>
      </AuthCard>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
      />
      <ContactAdminModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
