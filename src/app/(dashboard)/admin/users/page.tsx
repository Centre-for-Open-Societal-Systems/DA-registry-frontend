import type { Metadata } from "next";
import { UsersRoles } from "./components/UsersRoles";

export const metadata: Metadata = {
  title: "Users & Roles | OpenAgriNet",
  description: "RBAC assignments — roles, scopes and the permission matrix.",
};

export default function UsersPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <UsersRoles />
    </div>
  );
}
