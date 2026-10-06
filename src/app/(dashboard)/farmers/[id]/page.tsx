import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getFarmer } from "@/features/farmers";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileStats } from "./components/ProfileStats";
import { ProfileTabs } from "./components/ProfileTabs";
import { ProfileOverview } from "./components/ProfileOverview";
import { HoldingsSection } from "./components/HoldingsSection";
import { CropHistorySection } from "./components/CropHistorySection";
import { VisitHistorySection } from "./components/VisitHistorySection";
import { DocumentsSection } from "./components/DocumentsSection";
import { AdvisorySection } from "./components/AdvisorySection";
import { BackLink } from "@/components/ui/BackLink";

export async function generateMetadata(props: PageProps<"/farmers/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  const farmer = getFarmer(id);
  return {
    title: farmer ? `${farmer.name} | OpenAgriNet` : "Farmer not found | OpenAgriNet",
  };
}

export default async function FarmerProfilePage(props: PageProps<"/farmers/[id]">) {
  const { id } = await props.params;
  const farmer = getFarmer(id);
  if (!farmer) notFound();

  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/farmers" />

      <ProfileHeader farmer={farmer} />
      <ProfileStats farmer={farmer} />
      <ProfileTabs
        panels={{
          Overview: <ProfileOverview />,
          Holdings: <HoldingsSection />,
          "Crop history": <CropHistorySection />,
          "Visit history": <VisitHistorySection />,
          Documents: <DocumentsSection />,
          Advisory: <AdvisorySection farmerId={farmer.id} />,
        }}
      />
    </div>
  );
}
