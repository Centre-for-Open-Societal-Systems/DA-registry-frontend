import type { Metadata } from "next";
import { BackLink } from "@/components/ui/BackLink";
import { notFound } from "next/navigation";
import { getFarmer } from "@/features/farmers";
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
      <BackLink href={`/farmers/${farmer.id}`} label={`Back to ${farmer.name}`} />
      <ServicesWorkspace farmer={farmer} />
    </div>
  );
}
