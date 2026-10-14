import { cn } from "@/lib/utils";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-line-soft bg-white p-5 shadow-card", className)}>
      {children}
    </div>
  );
}
