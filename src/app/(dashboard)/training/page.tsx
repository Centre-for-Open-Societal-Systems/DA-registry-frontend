import type { Metadata } from "next";
import { TrainingWorkspace, type TrainingTab } from "./components/TrainingWorkspace";
import { RoleTraining } from "./components/RoleTraining";
import { SupervisorTrainingWorkspace } from "./components/SupervisorTrainingWorkspace";

export const metadata: Metadata = {
  title: "Training | OpenAgriNet",
  description: "Agrilearn courses, certificates and training compliance.",
};

const TABS: TrainingTab[] = ["courses", "calendar", "certificates"];

// ?tab= lets detail pages send the DA back to the tab they came from.
export default async function TrainingPage(props: PageProps<"/training">) {
  const { tab } = await props.searchParams;
  const initialTab = TABS.find((t) => t === tab) ?? "courses";
  return (
    <RoleTraining
      supervisor={<SupervisorTrainingWorkspace />}
      agent={<TrainingWorkspace key={initialTab} initialTab={initialTab} />}
    />
  );
}
