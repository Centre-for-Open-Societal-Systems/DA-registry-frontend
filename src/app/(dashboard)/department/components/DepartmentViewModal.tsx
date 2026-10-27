"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Pill";
import type { Department } from "@/features/superadmin";

interface DepartmentViewModalProps {
  department: Department;
  onClose: () => void;
  /** Closes this view and opens the Edit form for the same department. */
  onEdit: () => void;
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-[13.5px] text-ink-soft">{label}</dt>
      <dd className="text-[15px] font-semibold text-ink">{children}</dd>
    </div>
  );
}

// Read-only details for one department; Edit department jumps straight to the Edit form.
export function DepartmentViewModal({ department, onClose, onEdit }: DepartmentViewModalProps) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title="View Department"
      subtitle="View department information and its assigned coverage."
      size="lg"
      bodyClassName="px-4 py-5 sm:px-6"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="px-6">Close</Button>
          <Button variant="brand" onClick={onEdit} className="px-6">Edit department</Button>
        </>
      }
    >
      <h3 className="mb-4 text-[16px] font-semibold text-ink">Department details</h3>
      <dl className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">
        <Detail label="Department Name">{department.name}</Detail>
        <Detail label="Status">
          <Pill tone={department.active ? "green" : "red"} dot>{department.active ? "Active" : "Inactive"}</Pill>
        </Detail>
        <Detail label="Department Type">{department.type}</Detail>
        <Detail label="Department Code">{department.code}</Detail>
      </dl>
    </Modal>
  );
}
