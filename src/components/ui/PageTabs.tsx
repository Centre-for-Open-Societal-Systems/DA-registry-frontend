import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PageTab {
  label: string;
  href: string;
}

/** Tab strip container: sits flush at the top of a card, rounded to the card's corners. */
export const TAB_STRIP = "flex flex-wrap rounded-t-xl border-b border-line";

/** One tab: divided from its neighbour; the active tab is tinted with a green underline. Shared by PageTabs and SegmentTabs. */
export const tabClass = (active: boolean) =>
  cn(
    "inline-flex min-w-[110px] flex-1 items-center justify-center gap-2 whitespace-nowrap border-r border-line px-5 py-3 text-[14px] transition-colors sm:flex-none",
    active ? "-mb-px border-b-2 border-b-brand-green bg-brand-wash font-semibold text-brand-green" : "text-ink-soft hover:bg-surface hover:text-ink",
  );

// Link tabs across sibling routes (Farmers / Visits); rendered at the top of the page header card.
export function PageTabs({ tabs, activeHref }: { tabs: PageTab[]; activeHref: string }) {
  return (
    <div className={TAB_STRIP}>
      {tabs.map((tab) => {
        const active = tab.href === activeHref;
        return (
          <Link key={tab.href} href={tab.href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
