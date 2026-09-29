import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { PageTabs } from "@/components/ui/PageTabs";
import { FARMER_PAGE_TABS, TOTAL_FARMERS } from "@/features/farmers";

export function FarmersPageHeader() {
  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <PageTabs tabs={FARMER_PAGE_TABS} activeHref="/farmers" />

      {/* Title + actions */}
      <div className="flex flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight text-ink sm:text-[22px]">My Farmers</h1>
          <p className="mt-1 text-[13.5px] text-ink-soft">
            {TOTAL_FARMERS.toLocaleString()} farmers linked to you across your kebeles
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/farmers/new"
            className="inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New farmer
          </Link>
        </div>
      </div>
    </Card>
  );
}
