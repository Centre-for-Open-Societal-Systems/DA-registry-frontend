import type { Metadata } from "next";
import { AdvisorsWorkspace } from "./components/AdvisorsWorkspace";

export const metadata: Metadata = {
  title: "Advisors | OpenAgriNet",
  description: "Ministry of Agriculture subject-matter experts for specialist advisory support.",
};

export default function AdvisorsPage() {
  return <AdvisorsWorkspace />;
}
