import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgent } from "@/features/agents/data";
import { AgentProfile } from "./components/AgentProfile";

export async function generateMetadata(props: PageProps<"/agents/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const agent = getAgent(id);
  return { title: agent ? `${agent.fullName} | OpenAgriNet` : "Agent not found | OpenAgriNet" };
}

export default async function AgentProfilePage(props: PageProps<"/agents/[id]">) {
  const { id } = await props.params;
  const agent = getAgent(id);
  if (!agent) notFound();
  return <AgentProfile agent={agent} />;
}
