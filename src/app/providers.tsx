import type { ReactNode } from "react";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { AuthHydration } from "@/components/auth/AuthHydration";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AuthHydration />
      {children}
    </SidebarProvider>
  );
}
