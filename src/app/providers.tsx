import type { ReactNode } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthHydration } from "@/components/auth/AuthHydration";
import { ProfileSync } from "@/features/auth";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AuthHydration />
      <ProfileSync />
      {children}
    </SidebarProvider>
  );
}
