import type { ReactNode } from "react";
import { Card } from "./Card";
import { PageTabs, type PageTab } from "./PageTabs";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Right-aligned actions (buttons / links). */
  actions?: ReactNode;
  /** Link tabs across sibling routes, rendered at the top of the card. */
  tabs?: PageTab[];
  activeHref?: string;
  /** In-page state tabs (a SegmentTabs), rendered at the top of the card — use instead of `tabs`. */
  tabBar?: ReactNode;
  /** Inline element after the title, e.g. a status pill. */
  titleAddon?: ReactNode;
}

// Title card shared by every portal page: tab strip on top, then title + description with actions on the right.
// Banners, stats and the page's sections follow as separate cards below it.
export function PageHeader({ title, description, actions, tabs, activeHref, tabBar, titleAddon }: PageHeaderProps) {
  return (
    <Card className="relative p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      {tabs && activeHref && <PageTabs tabs={tabs} activeHref={activeHref} />}
      {tabBar}
      <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">{title}</h1>
            {titleAddon}
          </div>
          {description && <div className="mt-1 text-[14px] text-ink-soft">{description}</div>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </Card>
  );
}
