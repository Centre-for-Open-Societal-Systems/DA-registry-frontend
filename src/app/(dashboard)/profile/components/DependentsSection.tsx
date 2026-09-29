"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { getInitials } from "@/features/farmers";
import { AddDependentModal, type NewDependent } from "./AddDependentModal";

type DependentStatus = "Verified" | "Pending approval";

interface Dependent {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth: string; // ISO yyyy-mm-dd
  status: DependentStatus;
}

const SAMPLE_DEPENDENTS: Dependent[] = [
  { id: "1", name: "Meselech Alemu", relationship: "Spouse", dateOfBirth: "1993-09-22", status: "Verified" },
  { id: "2", name: "Yohannes Alemu", relationship: "Child", dateOfBirth: "2016-01-03", status: "Verified" },
  { id: "3", name: "Hana Alemu", relationship: "Child", dateOfBirth: "2019-11-18", status: "Pending approval" },
];

const STATUS_TONES: Record<DependentStatus, PillTone> = {
  Verified: "green",
  "Pending approval": "amber",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "1993-09-22" -> "22 Sep 1993"
function formatDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${day} ${MONTHS[Number(month) - 1]} ${year}`;
}

const COLUMNS: Column<Dependent>[] = [
  {
    key: "name",
    header: "Name",
    cell: (dep) => (
      <div className="flex items-center gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-[11px] font-semibold text-indigo-600">
          {getInitials(dep.name)}
        </span>
        <span className="font-medium text-ink">{dep.name}</span>
      </div>
    ),
  },
  { key: "relationship", header: "Relationship", cell: (dep) => dep.relationship },
  { key: "dob", header: "Date of birth", cell: (dep) => formatDate(dep.dateOfBirth) },
  { key: "status", header: "Status", cell: (dep) => <Pill tone={STATUS_TONES[dep.status]}>{dep.status}</Pill> },
];

export function DependentsSection() {
  const [dependents, setDependents] = useState<Dependent[]>(SAMPLE_DEPENDENTS);
  const [isAdding, setIsAdding] = useState(false);

  // New entries always start as pending — the Woreda officer verifies them
  const handleAdd = (dep: NewDependent) => {
    setDependents((prev) => [...prev, { id: `${Date.now()}`, ...dep, status: "Pending approval" }]);
  };

  return (
    <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col gap-3 border-b border-line px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">Family members / dependents</h2>
          <p className="mt-1 text-[12.5px] text-ink-soft">Add or update dependents; new entries need approval</p>
        </div>
        <Button type="button" variant="brand" size="md" onClick={() => setIsAdding(true)} className="w-fit shrink-0">
          + Add dependent
        </Button>
      </div>

      <DataTable
        columns={COLUMNS}
        rows={dependents}
        rowKey={(dep) => dep.id}
        minWidth="640px"
        itemLabel="dependents"
        emptyTitle="No dependents yet"
        emptyHint="Add a family member to start their approval."
      />
      <AddDependentModal isOpen={isAdding} onClose={() => setIsAdding(false)} onSubmit={handleAdd} />
    </Card>
  );
}
