"use client";

import { useEffect, useState } from "react";
import { Banner } from "@/components/ui/Banner";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  apiPlotToPlot,
  apiVisitToVisit,
  fetchFarmerPlots,
  fetchFarmerProfile,
  fetchFarmerUpdateStatus,
  fetchFarmerVisits,
  getCropSownDetails,
  getLivestockReportDetails,
  profileToFarmer,
  type Farmer,
  type Plot,
  type Visit,
} from "@/features/farmers";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileStats } from "./ProfileStats";
import { ProfileTabs } from "./ProfileTabs";
import { ProfileOverview } from "./ProfileOverview";
import { HoldingsSection } from "./HoldingsSection";
import { CropSownSection } from "./CropSownSection";
import { LivestockDetailsSection } from "./LivestockDetailsSection";
import { LivestockHistorySection } from "./LivestockHistorySection";
import { VisitHistorySection } from "./VisitHistorySection";
import { DocumentsSection } from "./DocumentsSection";
import { AdvisorySection } from "./AdvisorySection";

type Loaded =
  | { source: "api"; farmer: Farmer; plots: Plot[]; visits: Visit[]; notes: string[]; pendingUpdates: number }
  | { source: "sample"; farmer: Farmer; reason: string }
  | { source: "error"; reason: string };

/**
 * Farmer profile from GET /farmers/{id}/profile, with Holdings from /plots and Visit history from /visits.
 * A sample farmer id (links across the demo pages) falls back to the sample record when the API has no such farmer.
 */
export function FarmerProfileView({ id, sample }: { id: string; sample?: Farmer }) {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let current = true;
    (async () => {
      try {
        const profile = await fetchFarmerProfile(id);
        // Plots and visits are tabs; one failing still leaves a usable profile.
        const [plots, visits, updates] = await Promise.allSettled([fetchFarmerPlots(id), fetchFarmerVisits(id), fetchFarmerUpdateStatus(id)]);
        const plotRows = plots.status === "fulfilled" ? plots.value.map(apiPlotToPlot) : [];
        const visitRows = visits.status === "fulfilled" ? visits.value.items.map(apiVisitToVisit) : [];
        const notes = [plots.status === "rejected" && "plots", visits.status === "rejected" && "visit history"].filter((x): x is string => !!x);
        const farmer = profileToFarmer(profile, { plots: plotRows.length, visits: visits.status === "fulfilled" ? visits.value.total : 0 });
        if (current) setLoaded({ source: "api", farmer, plots: plotRows, visits: visitRows, notes, pendingUpdates: updates.status === "fulfilled" ? updates.value.total : 0 });
      } catch (err) {
        const reason = err instanceof Error ? err.message : "Could not load the farmer.";
        if (current) setLoaded(sample ? { source: "sample", farmer: sample, reason } : { source: "error", reason });
      }
    })();
    return () => {
      current = false;
    };
  }, [id, sample]);

  if (!loaded) {
    return (
      <Card className="px-4 py-10 text-center text-[13.5px] text-muted shadow-card">Loading farmer profile…</Card>
    );
  }

  if (loaded.source === "error") {
    return (
      <Card className="shadow-card">
        <EmptyState tone="error" title="Farmer not available" hint={loaded.reason} />
      </Card>
    );
  }

  const { farmer } = loaded;
  const fromApi = loaded.source === "api";

  return (
    <>
      {loaded.source === "sample" && (
        <Banner tone="warning" title="Showing sample data">
          {loaded.reason} This sample farmer is shown until the farmers service has the record.
        </Banner>
      )}
      {fromApi && loaded.notes.length > 0 && (
        <Banner tone="warning">Could not load {loaded.notes.join(" and ")} for this farmer; the other tabs are up to date.</Banner>
      )}

      {fromApi && loaded.pendingUpdates > 0 && (
        <Banner tone="info">{loaded.pendingUpdates === 1 ? "1 edit is" : `${loaded.pendingUpdates} edits are`} queued for the Farmer Registry and will sync in the background.</Banner>
      )}

      <ProfileHeader farmer={farmer} />
      <ProfileStats farmer={farmer} fromApi={fromApi} />
      <ProfileTabs
        panels={{
          Overview: <ProfileOverview />,
          Holdings: fromApi ? <HoldingsSection plots={loaded.plots} /> : <HoldingsSection />,
          "Crop Sown Details": <CropSownSection tabs={getCropSownDetails(farmer)} />,
          "Livestock Details": <LivestockDetailsSection tabs={getLivestockReportDetails(farmer)} />,
          "Livestock history": <LivestockHistorySection />,
          "Visit history": fromApi ? <VisitHistorySection visits={loaded.visits} /> : <VisitHistorySection />,
          Documents: <DocumentsSection />,
          Advisory: <AdvisorySection farmerId={farmer.id} />,
        }}
      />
    </>
  );
}
