import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSurveyTask } from "@/features/surveys";
import { SurveyCapture } from "./components/SurveyCapture";

export async function generateMetadata(props: PageProps<"/surveys/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const task = getSurveyTask(id);
  return { title: task ? `${task.name} | OpenAgriNet` : "Survey not found | OpenAgriNet" };
}

export default async function SurveyCapturePage(props: PageProps<"/surveys/[id]">) {
  const { id } = await props.params;
  const task = getSurveyTask(id);
  if (!task) notFound();
  return <SurveyCapture task={task} />;
}
