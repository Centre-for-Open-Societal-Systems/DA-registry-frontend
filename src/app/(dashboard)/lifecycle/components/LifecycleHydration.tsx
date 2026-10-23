"use client";

import { useEffect } from "react";
import { useLifecycleHistory } from "./useLifecycleHistory";

// The lifecycle store persists to localStorage but skips hydration, so the first client render matches the server HTML.
// This restores the stored requests once the dashboard is mounted (same as AuthHydration does for the session).
export function LifecycleHydration() {
  useEffect(() => {
    void useLifecycleHistory.persist.rehydrate();
  }, []);

  return null;
}
