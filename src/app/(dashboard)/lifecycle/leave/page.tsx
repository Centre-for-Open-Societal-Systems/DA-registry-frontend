import type { Metadata } from "next";
import { LeaveHistory } from "../components/LeaveHistory";

export const metadata: Metadata = {
  title: "Leave History | OpenAgriNet",
  description: "Leave balances and every leave or suspension request for the DA.",
};

export default function LeaveHistoryPage() {
  return <LeaveHistory />;
}
