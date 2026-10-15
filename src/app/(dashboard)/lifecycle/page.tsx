import type { Metadata } from "next";
import { LifecycleWorkspace } from "./components/LifecycleWorkspace";

export const metadata: Metadata = {
  title: "Lifecycle Management | OpenAgriNet",
  description: "Governed DA status changes — transfer, promotion, leave, retirement — with their approval and audit trail.",
};

export default function LifecyclePage() {
  return <LifecycleWorkspace />;
}
