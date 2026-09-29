import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function KpiSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-semibold text-ink">{title}</h2>
      <div className="px-5 py-5">{children}</div>
    </Card>
  );
}
