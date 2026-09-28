import { FarmerAvatar } from "./FarmerAvatar";

interface AttributionCardProps {
  name: string;
  avatar?: string;
  subtitle: string;
}

// Grey summary card shown at the top of the farmer-profile modals.
export function AttributionCard({ name, avatar, subtitle }: AttributionCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] px-4 py-3.5">
      <FarmerAvatar name={name} avatar={avatar} className="h-10 w-10 text-[14px]" />
      <div className="min-w-0">
        <p className="text-[14.5px] font-semibold text-[#1a2b3c]">{name}</p>
        <p className="mt-0.5 truncate text-[13px] text-[#64748b]">{subtitle}</p>
      </div>
    </div>
  );
}
