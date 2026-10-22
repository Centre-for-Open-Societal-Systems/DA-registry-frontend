import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ASSIGNMENT_FORMS, transitionFor } from "../../components/lifecycle";
import { InitiateTransition } from "../../components/InitiateTransition";
import { LeaveForm } from "../../components/LeaveForm";
import { ReactivationForm } from "../../components/ReactivationForm";
import { RetirementForm } from "../../components/RetirementForm";
import { SeparationForm } from "../../components/SeparationForm";

export const metadata: Metadata = {
  title: "Initiate Transition | OpenAgriNet",
  description: "Initiate a governed DA transfer, promotion, specialization change, leave, reactivation, retirement or separation for Woreda approval.",
};

export function generateStaticParams() {
  return [...ASSIGNMENT_FORMS.map((f) => ({ type: f.slug })), { type: "leave" }, { type: "reactivation" }, { type: "retirement" }, { type: "separation" }];
}

export default async function InitiateTransitionPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  if (type === "leave") return <LeaveForm />;
  if (type === "reactivation") return <ReactivationForm />;
  if (type === "retirement") return <RetirementForm />;
  if (type === "separation") return <SeparationForm />;
  const form = ASSIGNMENT_FORMS.find((f) => f.slug === type);
  const transition = form && transitionFor(form.code);
  if (!form || !transition) notFound();
  // Only the slug crosses to the client: the form config holds functions, which a server component cannot pass.
  return <InitiateTransition slug={form.slug} />;
}
