import type { Metadata } from "next";
import { SuperAdminUsers } from "./components/SuperAdminUsers";

export const metadata: Metadata = {
  title: "Users | OpenAgriNet",
  description: "All portal users, their role and department.",
};

export default function UsersPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <SuperAdminUsers />
    </div>
  );
}
