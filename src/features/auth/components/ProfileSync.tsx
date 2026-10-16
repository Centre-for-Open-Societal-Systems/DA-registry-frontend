"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { refreshProfile } from "../me";

// Once the stored session is back (AuthHydration), re-read /me so a role or scope an Admin changed since the
// last sign-in shows up without signing in again. Runs once per page load, and again after each new sign-in.
export function ProfileSync() {
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const hasTokens = useAuthStore((s) => !!s.tokens);

  useEffect(() => {
    if (hasHydrated && hasTokens) void refreshProfile();
  }, [hasHydrated, hasTokens]);

  return null;
}
