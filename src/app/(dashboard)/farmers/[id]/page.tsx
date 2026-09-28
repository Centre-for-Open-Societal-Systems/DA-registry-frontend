import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFarmer } from "@/features/farmers/data";
import { ProfileHeader } from "./components/ProfileHeader";
import { ProfileStats } from "./components/ProfileStats";
import { ProfileTabs } from "./components/ProfileTabs";

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
      <Link
        href="/farmers"
        className="inline-flex w-fit items-center gap-2.5 text-[15px] font-medium text-[#1a2b3c] transition-colors hover:text-brand-green"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      <ProfileHeader farmer={farmer} />
      <ProfileStats farmer={farmer} />
      <ProfileTabs />
    </div>
  );
}
