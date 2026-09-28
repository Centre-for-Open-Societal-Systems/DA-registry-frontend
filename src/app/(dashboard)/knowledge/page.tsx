import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { KnowledgeHub } from "./components/KnowledgeHub";

export const metadata: Metadata = {
  title: "Knowledge Base | OpenAgriNet",
  description: "Knowledge and advisory content for dissemination to farmers.",
};

export default function KnowledgePage() {
  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="Knowledge Base" description="Knowledge and advisory content merged into one hub. Open an article to send a snippet to linked farmers via SMS or Telegram." />
      <KnowledgeHub />
    </div>
  );
}
