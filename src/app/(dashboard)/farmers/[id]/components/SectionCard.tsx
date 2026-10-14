import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export function SectionCard({ title, action, children, className, bodyClassName }: SectionCardProps) {
  return (
    <section className={cn("flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-card", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {action}
      </div>
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}
