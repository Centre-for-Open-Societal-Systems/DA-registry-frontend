import { Metadata } from "next";
import { RegisterCard } from "./components/RegisterCard";

export const metadata: Metadata = {
  title: "Register | OpenAgriNet",
  description: "Create an account for the Ethiopia Agent Portal.",
};

export default function RegisterPage() {
  return <RegisterCard />;
}
