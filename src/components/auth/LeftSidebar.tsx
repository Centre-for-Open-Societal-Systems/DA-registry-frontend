import { LanguageSelector } from "@/components/auth/LanguageSelector";

export function LeftSidebar() {
  return (
    <div className="relative hidden h-full flex-col justify-between overflow-hidden bg-zinc-900 p-10 text-white lg:flex">
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">DA</span>
        <LanguageSelector />
      </div>
      <p className="text-sm text-zinc-400">All Pages · Registry Portal</p>
    </div>
  );
}
