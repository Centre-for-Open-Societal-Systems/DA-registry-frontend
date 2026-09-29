"use client";

import type { ReactNode } from "react";
import { useAuthStore } from "@/store/useAuthStore";

interface RoleDashboardProps {
  supervisor: ReactNode;
  executive: ReactNode;
  admin: ReactNode;
  comms: ReactNode;
  /** DA — the field-agent home, and the fallback for any other role. */
  agent: ReactNode;
}

// Role home varies (FSD §2.4): every role lands on the view built for its own job.
// The role lives in the client-side auth store, so only this switch runs on the client; the page renders each view.
export function RoleDashboard({ supervisor, executive, admin, comms, agent }: RoleDashboardProps) {
  const role = useAuthStore((s) => s.role);

  switch (role) {
    case "Supervisor":
      return supervisor;
    case "Executive":
      return executive;
    case "Admin":
      return admin;
    case "CommsOfficer":
      return comms;
    default:
      return agent;
  }
}
