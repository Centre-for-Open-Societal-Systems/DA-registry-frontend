import { Modal } from "@/components/ui/Modal";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { getFarmer } from "@/features/farmers";
import { RESCHEDULE_REASONS } from "../data";
import type { VisitRecord } from "../types";
import { VisitFarmerCard } from "./VisitFarmerCard";
import { VisitStatusPill } from "./VisitStatusPill";

interface RescheduleVisitModalProps {
  visit: VisitRecord | null;
  onClose: () => void;
}

export function RescheduleVisitModal({ visit, onClose }: RescheduleVisitModalProps) {
  if (!visit) return null;
  const farmer = getFarmer(visit.farmerId);

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Reschedule Visit"
      titleAddon={<VisitStatusPill status={visit.status} className="min-w-0" />}
      size="xl"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="reschedule-visit-form" variant="brand">
            Confirm reschedule
          </Button>
        </>
      }
    >
      <form
        id="reschedule-visit-form"
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          onClose();
        }}
      >
        <VisitFarmerCard visit={visit} phone={farmer?.phone} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="New date" htmlFor="reschedule-date">
            <Input id="reschedule-date" type="date" className="h-10 text-muted" required />
          </FormField>
          <FormField label="New time" htmlFor="reschedule-time">
            <Input id="reschedule-time" type="time" className="h-10 text-muted" required />
          </FormField>
        </div>

        <FormField label="Reason for rescheduling" htmlFor="reschedule-reason">
          <Select id="reschedule-reason" className="h-10" defaultValue="" required>
            <option value="" disabled>Select a reason</option>
            {RESCHEDULE_REASONS.map((reason) => (
              <option key={reason} value={reason}>{reason}</option>
            ))}
          </Select>
        </FormField>

        <Banner tone="info">{visit.farmerName} will be notified of the new time by SMS once confirmed.</Banner>
      </form>
    </Modal>
  );
}
