import Link from "next/link";
import { Card } from "@/components/ui/Card";

export function SummarySection() {
  return (
    <div className="flex flex-col">
      <h2 className="mb-3 text-[11.5px] font-semibold uppercase tracking-wide text-[#475569]">Today&apos;s Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Farm Visits — opens the visits list */}
        <Link href="/visits" className="block rounded-xl focus-visible:outline-2 focus-visible:outline-brand-green">
        <Card className="group flex h-[128px] flex-col justify-between overflow-hidden p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] border-l-4 border-l-[#3B82F6] transition-shadow hover:shadow-md">
          <div className="flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <p className="mb-1 text-[14px] font-medium text-[#4a5568]">Farm visits</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-[26px] font-semibold leading-none text-[#1a2b3c]">4</span>
                  <span className="text-[14px] text-[#718096]">of 6 planned</span>
                </div>
              </div>

              <div className="h-[60px] w-[60px] rounded-xl bg-[#E6F0FD] flex items-center justify-center text-[#3B82F6] shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.15] group-hover:-translate-y-1.5 group-hover:shadow-sm">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            </div>

            <div className="w-full bg-[#f1f5f9] rounded-full h-1.5 mt-auto">
              <div className="h-1.5 rounded-full bg-brand-green transition-all duration-1000 ease-out" style={{ width: "66%" }}></div>
            </div>
          </div>
        </Card>
        </Link>

        {/* Tasks */}
        <Card className="group flex h-[128px] flex-col justify-between overflow-hidden p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] border-l-4 border-l-[#8B5CF6] transition-shadow hover:shadow-md">
          <div className="flex justify-between items-start h-full">
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="mb-1 text-[14px] font-medium text-[#4a5568]">Tasks</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[26px] font-semibold leading-none text-[#1a2b3c]">4</span>
                  <span className="text-[14px] text-[#718096]">open · 3 done</span>
                </div>
              </div>
              <div className="flex gap-2 mt-auto mb-1">
                <span className="bg-[#FEF2F2] border-[#ffd2d2] border text-[#DC2626] text-[10px] tracking-wider font-semibold px-2.5 py-1 rounded-full">1 URGENT</span>
                <span className="bg-[#FEF3C7] border-[#f7e285] border text-[#D97706] text-[10px] tracking-wider font-semibold px-2.5 py-1 rounded-full">2 DUE TODAY</span>
              </div>
            </div>

            <div className="h-[60px] w-[60px] rounded-xl bg-[#F4E8FF] flex items-center justify-center text-[#8B5CF6] shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.15] group-hover:-translate-y-1.5 group-hover:shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 22h2c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3.1 4 3.6 4 4v3"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <circle cx="8" cy="16" r="6"></circle>
                <path d="M8 14v2l1.5 1.5"></path>
              </svg>
            </div>
          </div>
        </Card>

        {/* Sync Status */}
        <Card className="group flex h-[128px] flex-col justify-between overflow-hidden p-4 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] border-l-4 border-l-brand-green transition-shadow hover:shadow-md">
          <div className="flex justify-between items-start h-full">
            <div className="flex flex-col justify-between h-full">
              <div>
                <p className="mb-1 text-[14px] font-medium text-[#4a5568]">Sync status</p>
                <div className="flex items-center gap-2">
                  <svg className="w-[18px] h-[18px] text-[#037957]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 12.5l3 3 5-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-[15px] font-semibold text-[#1a2b3c]">All data synced</span>
                </div>
              </div>
              <p className="text-[13px] text-[#718096] mt-auto">5 min ago</p>
            </div>

            <div className="h-[60px] w-[60px] rounded-xl bg-[#D1FAE5] flex items-center justify-center text-[#037957] shrink-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-[1.15] group-hover:-translate-y-1.5 group-hover:shadow-sm">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_707_7085)">
                  <path d="M21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.48395 3.00947 7.06897 3.99122 5.26 5.74L3 8M8 8H3V3M3 12C3 14.3869 3.94821 16.6761 5.63604 18.364C7.32387 20.0518 9.61305 21 12 21C14.516 20.9905 16.931 20.0088 18.74 18.26L21 16M21 21V16H16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </g>
                <defs>
                  <clipPath id="clip0_707_7085">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>

            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
