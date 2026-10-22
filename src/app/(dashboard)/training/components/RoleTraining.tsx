"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/store/useAuthStore";

// Supervisor sees team compliance across the woreda; the DA sees their own courses and certificates.
export function RoleTraining({ supervisor, agent }: { supervisor: ReactNode; agent: ReactNode }) {
  const role = useAuthStore((s) => s.role);
  return role === "Supervisor" ? supervisor : agent;
}
