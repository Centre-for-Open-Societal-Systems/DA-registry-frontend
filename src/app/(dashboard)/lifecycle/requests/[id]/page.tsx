import type { Metadata } from "next";
import { RequestDetail } from "../../components/RequestDetail";

export const metadata: Metadata = {
  title: "Lifecycle Request | OpenAgriNet",
  description: "Status, approval route and audit entry of a DA lifecycle request.",
};

export default async function LifecycleRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RequestDetail id={id} />;
}
