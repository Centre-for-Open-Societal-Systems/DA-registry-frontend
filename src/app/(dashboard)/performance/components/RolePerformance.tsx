"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/store/useAuthStore";

// Supervisor sees woreda-wide KPIs, tiers and the agent registry; DA sees their own goals.
// The role lives in the client-side auth store, so only this switch runs on the client; the page renders each view.
export function RolePerformance({ supervisor, agent }: { supervisor: ReactNode; agent: ReactNode }) {
  const role = useAuthStore((s) => s.role);
  return role === "Supervisor" ? supervisor : agent;
}
