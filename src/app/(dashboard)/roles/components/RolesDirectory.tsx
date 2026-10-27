"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Banner } from "@/components/ui/Banner";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Pill } from "@/components/ui/Pill";
import { RowAction } from "@/components/ui/RowAction";
import { SearchInput } from "@/components/ui/SearchInput";
import { Switch } from "@/components/ui/Switch";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { SA_ROLES, type PermissionSet, type SuperAdminRole } from "@/features/superadmin";
import { matchesQuery } from "@/lib/search";
import { RoleFormModal } from "./RoleFormModal";

type FilterKey = "name" | "status";
type Filters = Record<FilterKey, Set<string>>;
const EMPTY: Filters = { name: new Set(), status: new Set() };

const statusLabel = (r: SuperAdminRole) => (r.active ? "Active" : "Inactive");

const optionsOf = (values: string[], order?: readonly string[]): FilterOption[] =>
  (order ?? [...new Set(values)]).map((value) => ({ value, label: value, count: values.filter((v) => v === value).length }));

type Dialog = { kind: "add" } | { kind: "edit" | "delete"; role: SuperAdminRole } | null;

// Super Admin → Roles: the roles users can be assigned to (mock data, held in local state).
export function RolesDirectory() {
  const [roles, setRoles] = useState<SuperAdminRole[]>(SA_ROLES);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const setFilter = (key: FilterKey) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));
  const activeFilterCount = Object.values(filters).filter((s) => s.size > 0).length;

  const nameOptions = optionsOf(roles.map((r) => r.name));
  const statusOptions = optionsOf(roles.map(statusLabel), ["Active", "Inactive"]);

  const rows = roles.filter(
    (r) =>
      matchesQuery(query, r) &&
      (filters.name.size === 0 || filters.name.has(r.name)) &&
      (filters.status.size === 0 || filters.status.has(statusLabel(r))),
  );

  const filterFields: FilterFieldConfig[] = [
    { key: "name", label: "Role name", allLabel: "All roles", placeholder: "All Roles", options: nameOptions },
    { key: "status", label: "Status", allLabel: "All statuses", placeholder: "All", options: statusOptions },
  ];

  const add = (name: string, permissions: Record<string, PermissionSet>) => {
    setRoles((prev) => [...prev, { id: `r${Date.now()}`, name, active: true, permissions }]);
    setDialog(null);
    setNotice(`${name} was added.`);
  };
  const edit = (id: string, name: string, permissions: Record<string, PermissionSet>) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, name, permissions } : r)));
    setDialog(null);
    setNotice(`${name} was updated.`);
  };
  const toggle = (id: string, active: boolean) => setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, active } : r)));
  const remove = (role: SuperAdminRole) => {
    setRoles((prev) => prev.filter((r) => r.id !== role.id));
    setDialog(null);
    setNotice(`${role.name} was deleted.`);
  };

  const columns: Column<SuperAdminRole>[] = [
    { key: "name", header: <FilterDropdown label="Role Name" allLabel="All roles" options={nameOptions} selected={filters.name} onApply={setFilter("name")} />, cell: (r) => <span className="font-semibold text-ink">{r.name}</span>, className: "w-[30%]" },
    { key: "status", header: <FilterDropdown label="Status" allLabel="All statuses" options={statusOptions} selected={filters.status} onApply={setFilter("status")} />, cell: (r) => <Pill tone={r.active ? "green" : "red"}>{statusLabel(r)}</Pill>, className: "w-[25%]" },
    {
      key: "action",
      header: <span className="text-ink">Action</span>,
      align: "center",
      cell: (r) => (
        <div className="flex items-center justify-center gap-2">
          <RowAction icon="edit" onClick={() => setDialog({ kind: "edit", role: r })}>Edit</RowAction>
          <RowAction tone="danger" onClick={() => setDialog({ kind: "delete", role: r })}>Delete</RowAction>
          <Switch checked={r.active} onChange={(v) => toggle(r.id, v)} label={`${r.active ? "Deactivate" : "Activate"} ${r.name}`} />
        </div>
      ),
    },
  ];

  const takenNames = roles.map((r) => r.name);

  return (
    <>
      <PageHeader
        title="Roles"
        description="Manage users, roles and access"
        showDescription
        actions={
          <button
            type="button"
            onClick={() => setDialog({ kind: "add" })}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add Role
          </button>
        }
      />
      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}
      <Card className="overflow-hidden p-0 shadow-card">
        <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-ink">Roles directory</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-soft">View and manage roles across all regions.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
            <SearchInput value={query} onChange={setQuery} placeholder="Search Role name, code..." />
            <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
          </div>
        </div>
        <DataTable itemLabel="roles" columns={columns} rows={rows} rowKey={(r) => r.id} minWidth="700px" paginate={false} emptyTitle="No roles match" emptyHint="Clear a filter or try a different search." />
        <AdvancedFiltersDrawer
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          fields={filterFields}
          filters={filters as FilterSelection}
          onApply={(next) => setFilters({ name: next.name ?? new Set(), status: next.status ?? new Set() })}
        />
      </Card>

      {dialog?.kind === "add" && <RoleFormModal mode="add" takenNames={takenNames} onClose={() => setDialog(null)} onSave={add} />}
      {dialog?.kind === "edit" && <RoleFormModal mode="edit" initial={dialog.role} takenNames={takenNames} onClose={() => setDialog(null)} onSave={(name, permissions) => edit(dialog.role.id, name, permissions)} />}
      {dialog?.kind === "delete" && (
        <Modal
          isOpen
          onClose={() => setDialog(null)}
          title="Delete Role?"
          subtitle={dialog.role.name}
          size="lg"
          bodyClassName="px-4 py-5 sm:px-6"
          footer={
            <>
              <Button variant="outline" onClick={() => setDialog(null)} className="px-6">Cancel</Button>
              <Button variant="danger" onClick={() => remove(dialog.role)} className="px-6">Delete role</Button>
            </>
          }
        >
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Are you sure you want to delete {dialog.role.name} from the roles directory?
          </p>
        </Modal>
      )}
    </>
  );
}
