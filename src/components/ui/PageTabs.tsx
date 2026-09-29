import Link from "next/link";
import { cn } from "@/lib/utils";

export interface PageTab {
  label: string;
  href: string;
}

// Top tab strip used by the Farmers / Visits pages.
export function PageTabs({ tabs, activeHref }: { tabs: PageTab[]; activeHref: string }) {
  return (
    // On phones the tabs share the row equally and never wrap their label; the strip scrolls if it still overflows
    <div className="flex overflow-x-auto border-b border-line [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const active = tab.href === activeHref;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 whitespace-nowrap px-3 py-3.5 text-center text-[14px] transition-colors sm:flex-none sm:px-4 sm:text-left",
              active
                ? "-mb-px border-b-2 border-brand-green bg-brand-wash font-medium text-brand-green"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
