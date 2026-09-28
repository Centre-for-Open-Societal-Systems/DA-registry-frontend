import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pill } from "@/components/ui/Pill";
import { SurveyTasks } from "./components/SurveyTasks";

export const metadata: Metadata = {
  title: "Surveys | OpenAgriNet",
  description: "Farmer satisfaction survey response collection.",
};

export default function SurveysPage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Surveys"
        titleAddon={<Pill tone="slate">Design · Deploy · Analyse = Part 2</Pill>}
        description="Field collection of farmer satisfaction surveys: assigned task → consent → question-by-question capture → offline sync → results. Templates are versioned; a deployment stays bound to the version it was published with."
      />
      <SurveyTasks />
    </div>
  );
}
