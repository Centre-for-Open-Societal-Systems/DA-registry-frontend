import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { UsersRoles } from "./components/UsersRoles";

export const metadata: Metadata = {
  title: "Users & Roles | OpenAgriNet",
  description: "RBAC assignments — roles, scopes and the permission matrix.",
};

export default function UsersPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="Users & Roles" description="Cross-region administration of users, roles and Woreda/region scopes (Appendix B/D). Every assignment is audited." />
      <UsersRoles />
    </div>
  );
}
