import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function KpiSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-0 shadow-card">
      <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-semibold text-ink">{title}</h2>
      <div className="px-5 py-5">{children}</div>
    </Card>
  );
}
