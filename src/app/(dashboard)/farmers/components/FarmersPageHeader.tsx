import { PageHeader } from "@/components/ui/PageHeader";
import { FARMER_PAGE_TABS, TOTAL_FARMERS } from "@/features/farmers";

// The New farmer button is hidden for now; the /farmers/new registration page is still in place.
export function FarmersPageHeader() {
  return (
    <PageHeader
      tabs={FARMER_PAGE_TABS}
      activeHref="/farmers"
      title="My Farmers"
      description={`${TOTAL_FARMERS.toLocaleString()} farmers linked to you across your kebeles`}
    />
  );
}
