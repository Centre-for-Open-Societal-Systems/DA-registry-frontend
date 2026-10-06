import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSurveyTask } from "@/features/surveys";
import { SurveyCapture } from "./components/SurveyCapture";
import { CreatedSurveyCapture } from "./components/CreatedSurveyCapture";

export async function generateMetadata(props: PageProps<"/surveys/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const task = getSurveyTask(id);
  return { title: task ? `${task.name} | OpenAgriNet` : "Survey | OpenAgriNet" };
}

export default async function SurveyCapturePage(props: PageProps<"/surveys/[id]">) {
  const { id } = await props.params;
  const task = getSurveyTask(id);
  // Not in the seeded list: it may be a survey published from a template this session.
  if (!task) return id.startsWith("srv-new-") ? <CreatedSurveyCapture id={id} /> : notFound();
  return <SurveyCapture task={task} />;
}
