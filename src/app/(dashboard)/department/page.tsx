import type { Metadata } from "next";
import { DepartmentDirectory } from "./components/DepartmentDirectory";

export const metadata: Metadata = {
  title: "Department | OpenAgriNet",
  description: "Manage departments across all regions.",
};

export default function DepartmentPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <DepartmentDirectory />
    </div>
  );
}
