import type { Metadata } from "next";
import { getFarmer } from "@/features/farmers";
import { BackLink } from "@/components/ui/BackLink";
import { FarmerProfileView } from "./components/FarmerProfileView";

export async function generateMetadata(props: PageProps<"/farmers/[id]">): Promise<Metadata> {
  const { id } = await props.params;
  // The profile itself loads on the client (it needs the signed-in user's token), so only sample ids have a name here.
  const sample = getFarmer(id);
  return { title: sample ? `${sample.name} | OpenAgriNet` : "Farmer profile | OpenAgriNet" };
}

export default async function FarmerProfilePage(props: PageProps<"/farmers/[id]">) {
  const { id } = await props.params;

  return (
    <div className="flex w-full flex-col gap-4">
      <BackLink href="/farmers" />
      <FarmerProfileView id={id} sample={getFarmer(id)} />
    </div>
  );
}
