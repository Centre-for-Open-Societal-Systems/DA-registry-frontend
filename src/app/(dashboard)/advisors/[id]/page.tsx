import type { Metadata } from "next";
import { getAdvisor } from "@/features/communication";
import { AdvisorDetails } from "./components/AdvisorDetails";

export async function generateMetadata(props: PageProps<"/advisors/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const advisor = getAdvisor(id);
  return { title: advisor ? `${advisor.name} | OpenAgriNet` : "Advisor Details | OpenAgriNet" };
}

// The record is read from the client-side advisors store, so an advisor the Admin added this session opens too.
export default async function AdvisorDetailsPage(props: PageProps<"/advisors/[id]">) {
  const { id } = await props.params;
  return <AdvisorDetails id={decodeURIComponent(id)} />;
}
