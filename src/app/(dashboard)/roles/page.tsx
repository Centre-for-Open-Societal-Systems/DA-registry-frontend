import type { Metadata } from "next";
import { RolesDirectory } from "./components/RolesDirectory";

export const metadata: Metadata = {
  title: "Roles | OpenAgriNet",
  description: "Manage users, roles and access.",
};

export default function RolesPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <RolesDirectory />
    </div>
  );
}
