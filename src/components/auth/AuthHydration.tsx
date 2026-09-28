"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

// The auth store persists to localStorage but skips hydration, so the first client render matches the
// server HTML. This restores the stored session once the tree is mounted.
export function AuthHydration() {
  useEffect(() => {
    void useAuthStore.persist.rehydrate();
  }, []);

  return null;
}
