import { Metadata } from "next";
import { FarmersPageHeader } from "./components/FarmersPageHeader";
import { FarmersTable } from "./components/FarmersTable";

export const metadata: Metadata = {
  title: "My Farmers | OpenAgriNet",
  description: "Farmers linked to you across your kebeles.",
};

export default function FarmersPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <FarmersPageHeader />
      <FarmersTable />
    </div>
  );
}
