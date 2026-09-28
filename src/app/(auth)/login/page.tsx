import { Metadata } from "next";
import { BrandPanel } from "./components/BrandPanel";
import { LoginCard } from "./components/LoginCard";

export const metadata: Metadata = {
  title: "Login | OpenAgriNet",
  description: "Sign in to the Ethiopia Agent Portal.",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-emerald-950">
      <div className="absolute inset-0 bg-[url('/bg-auth.png')] bg-cover bg-right bg-no-repeat" />
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2">
        <BrandPanel />
        <div className="relative z-20 flex items-center justify-center p-4 md:p-8 lg:p-12 pt-12 md:pt-16">
          <LoginCard />
        </div>
      </div>
    </div>
  );
}