import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card } from "./Card";
import { PageTabs, type PageTab } from "./PageTabs";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Right-aligned actions (buttons / links). */
  actions?: ReactNode;
  /** Optional in-page tab strip rendered above the title (hub pages). */
  tabs?: PageTab[];
  activeHref?: string;
  /** Inline element after the title, e.g. a status pill. */
  titleAddon?: ReactNode;
}

// Title card shared by every portal page: optional tab strip, title + description, actions on the right.
export function PageHeader({ title, description, actions, tabs, activeHref, titleAddon }: PageHeaderProps) {
  return (
    <Card className={cn("relative p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]", tabs && "overflow-hidden")}>
      {tabs && activeHref && <PageTabs tabs={tabs} activeHref={activeHref} />}
      <div className="flex flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">{title}</h1>
            {titleAddon}
          </div>
          {description && <p className="mt-1.5 text-[14px] text-ink-soft">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </Card>
  );
}
