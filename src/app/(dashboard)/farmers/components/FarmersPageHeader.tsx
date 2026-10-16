import { PageHeader } from "@/components/ui/PageHeader";
import { FARMER_PAGE_TABS } from "@/features/farmers";

// The New farmer button is hidden for now; the /farmers/new registration page is still in place.
export function FarmersPageHeader() {
  return (
    <PageHeader
      tabs={FARMER_PAGE_TABS}
      activeHref="/farmers"
      title="My Farmers"
      description="Farmers linked to you across your kebeles; the total is shown on the list below"
    />
  );
}
