import type { ReactNode } from "react";
import { BrandPanel } from "./components/BrandPanel";

// Backdrop and brand panel live in the layout so they stay put while moving between /login and /register;
// only the card on the right swaps (with its own entrance animation).
// The page is one viewport tall and scrolls internally when it must, without a visible scrollbar.
// Spacing follows both width (sm/md/lg) and height (short/tiny) so the card fits laptops and phones alike.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="no-scrollbar relative h-dvh overflow-x-hidden overflow-y-auto bg-emerald-950">
      <div className="absolute inset-0 bg-[url('/bg-auth.png')] bg-cover bg-right bg-no-repeat" />
      <div className="relative z-10 grid min-h-full grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <BrandPanel />
        <div className="relative z-20 flex items-center justify-center px-3 pt-10 pb-6 sm:px-6 md:pt-12 lg:px-8 lg:pb-6 short:pt-9 short:pb-3">
          {children}
        </div>
      </div>
    </div>
  );
}
