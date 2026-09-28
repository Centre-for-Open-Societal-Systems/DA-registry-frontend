import type { ReactNode } from "react";
import { LeftSidebar } from "@/components/auth/LeftSidebar";
import { BackLink } from "@/components/auth/BackLink";

export function PortalShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
      <LeftSidebar />
      <div className="flex flex-col">
        <div className="p-6">
          <BackLink href="/" label="Back to home" />
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
