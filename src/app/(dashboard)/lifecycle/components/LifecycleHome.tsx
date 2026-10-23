"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { LifecycleWorkspace } from "./LifecycleWorkspace";
import { ReviewWorkspace } from "./ReviewWorkspace";

// The DA raises and tracks their own transitions; the Supervisor and the Admin work the review queue.
export function LifecycleHome() {
  const role = useAuthStore((s) => s.role);
  if (role === "Admin" || role === "Supervisor") return <ReviewWorkspace role={role} />;
  return <LifecycleWorkspace />;
}
