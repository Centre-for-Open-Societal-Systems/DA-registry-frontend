import type { Metadata } from "next";
import { CertificateDetails } from "./components/CertificateDetails";

export const metadata: Metadata = {
  title: "Certificate Details | OpenAgriNet",
};

// The record is read from the client-side certificates store, so a certificate added this session opens too.
export default async function CertificateDetailsPage(props: PageProps<"/training/certificates/[id]">) {
  const { id } = await props.params;
  return <CertificateDetails id={decodeURIComponent(id)} />;
}
