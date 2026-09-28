import { cn } from "@/lib/utils";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-[#E5E7EB] bg-white p-5", className)}>
      {children}
    </div>
  );
}
