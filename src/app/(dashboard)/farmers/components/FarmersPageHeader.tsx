import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { FARMER_PAGE_TABS, TOTAL_FARMERS } from "@/features/farmers";

export function FarmersPageHeader() {
  return (
    <PageHeader
      tabs={FARMER_PAGE_TABS}
      activeHref="/farmers"
      title="My Farmers"
      description={`${TOTAL_FARMERS.toLocaleString()} farmers linked to you across your kebeles`}
      actions={
        <Link
          href="/farmers/new"
          className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-brand-green px-4 text-[14px] font-semibold text-white transition-colors hover:bg-brand-green-dark"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New farmer
        </Link>
      }
    />
  );
}
