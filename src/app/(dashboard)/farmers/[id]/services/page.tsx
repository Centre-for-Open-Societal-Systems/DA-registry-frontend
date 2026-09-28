import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { getFarmer } from "@/features/farmers/data";
import { ServicesWorkspace } from "./components/ServicesWorkspace";

export async function generateMetadata(props: PageProps<"/farmers/[id]/services">): Promise<Metadata> {
  const { id } = await props.params;
  const farmer = getFarmer(id);
  return { title: farmer ? `Services — ${farmer.name} | OpenAgriNet` : "Farmer not found | OpenAgriNet" };
}

export default async function FarmerServicesPage(props: PageProps<"/farmers/[id]/services">) {
  const { id } = await props.params;
  const farmer = getFarmer(id);
  if (!farmer) notFound();

  return (
    <div className="flex w-full flex-col gap-4">
      <Link href={`/farmers/${farmer.id}`} className="inline-flex w-fit items-center gap-2.5 text-[15px] font-medium text-[#1a2b3c] transition-colors hover:text-brand-green">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        Back to {farmer.name}
      </Link>
      <PageHeader
        title={`Services — ${farmer.name}`}
        description="Credit and Marketplace are unrelated transactions with different counterparties and lifecycles, so they are kept on separate tabs."
      />
      <ServicesWorkspace farmer={farmer} />
    </div>
  );
}
