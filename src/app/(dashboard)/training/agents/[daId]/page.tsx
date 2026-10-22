import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAgentTraining } from "@/features/performance";
import { AgentTrainingDetails } from "./components/AgentTrainingDetails";

export async function generateMetadata(props: PageProps<"/training/agents/[daId]">): Promise<Metadata> {
  const { daId } = await props.params;
  const detail = getAgentTraining(daId);
  return { title: detail ? `${detail.agent.name} training | OpenAgriNet` : "Agent not found | OpenAgriNet" };
}

export default async function AgentTrainingPage(props: PageProps<"/training/agents/[daId]">) {
  const { daId } = await props.params;
  const detail = getAgentTraining(daId);
  if (!detail) notFound();
  return <AgentTrainingDetails detail={detail} />;
}
