"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { AdvancedFiltersButton } from "@/components/ui/AdvancedFiltersButton";
import { RowAction } from "@/components/ui/RowAction";
import { DataTable, type Column } from "@/components/ui/DataTable";
import { Pill, type PillTone } from "@/components/ui/Pill";
import { Banner } from "@/components/ui/Banner";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentTabs } from "@/components/ui/SegmentTabs";
import { FilterDropdown, type FilterOption } from "@/components/ui/FilterDropdown";
import { AdvancedFiltersDrawer, type FilterFieldConfig, type FilterSelection } from "@/components/ui/AdvancedFiltersDrawer";
import { ROLE_LABELS, ROLES, type Role } from "@/lib/rbac";
import { matchesQuery, searchPlaceholder } from "@/lib/search";
import { UserFormModal, type UserFormValues } from "./UserFormModal";

// §5 RBAC assignment: user_id, role, active, region_scope, woreda_scope, effective_from/to, assigned_by.
interface RbacAssignment {
  userId: string;
  name: string;
  faydaId: string;
  phone: string;
  email: string;
  role: Role;
  active: boolean;
  regionScope: string;
  woredaScope: string;
  effectiveFrom: string;
  effectiveTo: string;
  assignedBy: string;
}

const USERS: RbacAssignment[] = [
  { userId: "U-1001", name: "Tadesse Alemu", faydaId: "3512 4498 7712", phone: "+251 91 234 5678", email: "tadesse.alemu@moa.gov.et", role: "DA", active: true, regionScope: "Oromia", woredaScope: "Bako Tibe", effectiveFrom: "12 Mar 2019", effectiveTo: "—", assignedBy: "System (onboarding)" },
  { userId: "U-1002", name: "Kebede Alemu", faydaId: "3512 7733 1188", phone: "+251 91 776 3321", email: "kebede.alemu@moa.gov.et", role: "Supervisor", active: true, regionScope: "Oromia", woredaScope: "Bako Tibe", effectiveFrom: "01 Jan 2024", effectiveTo: "—", assignedBy: "Yonas Haile (Admin)" },
  { userId: "U-1003", name: "Almaz Tesfaye", faydaId: "3512 2201 8843", phone: "+251 92 118 4402", email: "almaz.tesfaye@moa.gov.et", role: "CommsOfficer", active: true, regionScope: "Oromia", woredaScope: "Bako Tibe", effectiveFrom: "15 May 2025", effectiveTo: "—", assignedBy: "Yonas Haile (Admin)" },
  { userId: "U-1004", name: "Getachew Bekele", faydaId: "3512 9910 3321", phone: "+251 91 900 1234", email: "getachew.bekele@moa.gov.et", role: "Executive", active: true, regionScope: "Oromia", woredaScope: "All (read)", effectiveFrom: "01 Jul 2023", effectiveTo: "—", assignedBy: "Yonas Haile (Admin)" },
  { userId: "U-1005", name: "Yonas Haile", faydaId: "3512 1188 5544", phone: "+251 91 555 0101", email: "yonas.haile@ati.gov.et", role: "Admin", active: true, regionScope: "All regions", woredaScope: "All", effectiveFrom: "01 Jan 2023", effectiveTo: "—", assignedBy: "ATI root" },
  { userId: "U-1006", name: "Dawit Assefa", faydaId: "3512 2299 7710", phone: "+251 93 410 7788", email: "dawit.assefa@moa.gov.et", role: "DA", active: false, regionScope: "Oromia", woredaScope: "Cheliya", effectiveFrom: "02 May 2016", effectiveTo: "30 Jun 2026", assignedBy: "System (separation)" },
];

const ROLE_TONE: Record<Role, PillTone> = { DA: "green", Supervisor: "blue", Executive: "purple", Admin: "red", CommsOfficer: "amber" };

const PERMISSIONS: { role: Role; can: string; cannot: string }[] = [
  { role: "DA", can: "Own profile; self-service (approval-gated); field capture; linked farmers; raise/track grievances; report issues; complete surveys", cannot: "Approve onboarding/lifecycle; assign agents; edit segment rules; KPI entry; executive dashboards; triage grievances; resolve issues" },
  { role: "Supervisor", can: "Approve/reject onboarding & lifecycle; assign/reassign agents; team KPIs; all team visits; internal-issue queue", cannot: "Cross-Woreda edits; admin of users/roles/master data; edit KPI governance formulas" },
  { role: "Executive", can: "Read regional roll-ups, SLA, reports; drill down to DA detail", cannot: "Any edit; approvals; assignments; identity changes" },
  { role: "Admin", can: "Users/roles/scopes; routing & sync config; master data; audit; KPI governance", cannot: "Delete immutable audit records; act outside the audit trail" },
  { role: "CommsOfficer", can: "Alert inbox; craft/dispatch broadcasts; knowledge dissemination", cannot: "DA identity edits; approvals; assignments" },
];

type Tab = "users" | "matrix";

const SEARCH_PLACEHOLDER = searchPlaceholder(["User", "Role", "Scope", "Active", "Effective", "Assigned by"]);

const optionsOf = (values: string[], order?: readonly string[], label?: (v: string) => string): FilterOption[] =>
  (order ?? [...new Set(values)]).map((value) => ({ value, label: label ? label(value) : value, count: values.filter((v) => v === value).length }));

const activeLabel = (u: RbacAssignment) => (u.active ? "Active" : "Inactive");

interface UserFilters extends FilterSelection {
  role: Set<string>;
  active: Set<string>;
  region: Set<string>;
  scope: Set<string>;
}
const EMPTY: UserFilters = { role: new Set(), active: new Set(), region: new Set(), scope: new Set() };

export function UsersRoles() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState(USERS);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<RbacAssignment | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [filters, setFilters] = useState<UserFilters>(EMPTY);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const activeFilterCount = Object.values(filters).filter((set) => set.size > 0).length;
  const setFilter = (key: keyof UserFilters) => (next: Set<string>) => setFilters((prev) => ({ ...prev, [key]: next }));

  const roleOptions = optionsOf(users.map((u) => u.role), ROLES, (r) => ROLE_LABELS[r as Role]);
  const activeOptions = optionsOf(users.map(activeLabel), ["Active", "Inactive"]);
  const regionOptions = optionsOf(users.map((u) => u.regionScope));
  const scopeOptions = optionsOf(users.map((u) => u.woredaScope));
  const filterFields: FilterFieldConfig[] = [
    { key: "role", label: "Role", allLabel: "All roles", placeholder: "All roles", options: roleOptions },
    { key: "active", label: "Active", allLabel: "All users", placeholder: "All", options: activeOptions },
    { key: "region", label: "Region scope", allLabel: "All regions", placeholder: "All regions", options: regionOptions },
    { key: "scope", label: "Woreda scope", allLabel: "All woreda scopes", placeholder: "All woreda scopes", options: scopeOptions },
  ];

  const addUser = (draft: UserFormValues) => {
    const userId = `U-${1001 + users.length}`;
    // Fayda linking happens at first sign-in, so a new account starts without one
    setUsers((prev) => [{ userId, faydaId: "", ...draft, assignedBy: "Yonas Haile (Admin)" }, ...prev]);
    setAdding(false);
    setTab("users");
    setNotice(`${draft.name} (${userId}) added as ${ROLE_LABELS[draft.role]} · ${draft.woredaScope}. An invite was sent to ${draft.phone}; the assignment is recorded in the audit log.`);
  };

  const rows = users.filter(
    (u) =>
      (filters.role.size === 0 || filters.role.has(u.role)) &&
      (filters.active.size === 0 || filters.active.has(activeLabel(u))) &&
      (filters.region.size === 0 || filters.region.has(u.regionScope)) &&
      (filters.scope.size === 0 || filters.scope.has(u.woredaScope)) &&
      matchesQuery(query, u, ROLE_LABELS[u.role], activeLabel(u)),
  );

  const saveEdit = (values: UserFormValues) => {
    if (!editing) return;
    setUsers((prev) => prev.map((u) => (u.userId === editing.userId ? { ...u, ...values, assignedBy: "Yonas Haile (Admin)" } : u)));
    setNotice(`${values.name} (${editing.userId}) updated — ${ROLE_LABELS[values.role]} · ${values.woredaScope} · ${values.active ? "Active" : "Inactive"}. Recorded in the audit log with your identity and timestamp.`);
    setEditing(null);
  };

  const columns: Column<RbacAssignment>[] = [
    { key: "user", header: "User", cell: (u) => <span><span className="font-medium text-ink">{u.name}</span><span className="block font-mono text-[12px] text-muted">{u.userId} · {u.faydaId ? `Fayda ${u.faydaId}` : "Fayda not linked yet"}</span></span> },
    { key: "role", header: <FilterDropdown label="Role" allLabel="All roles" options={roleOptions} selected={filters.role} onApply={setFilter("role")} />, cell: (u) => <Pill tone={ROLE_TONE[u.role]}>{ROLE_LABELS[u.role]}</Pill> },
    { key: "scope", header: <FilterDropdown label="Scope" allLabel="All woreda scopes" options={scopeOptions} selected={filters.scope} onApply={setFilter("scope")} />, cell: (u) => <span className="text-[13px]">{u.regionScope}<span className="block text-[12px] text-muted">{u.woredaScope}</span></span> },
    { key: "active", header: <FilterDropdown label="Active" allLabel="All users" options={activeOptions} selected={filters.active} onApply={setFilter("active")} />, cell: (u) => <Pill tone={u.active ? "green" : "slate"} dot>{u.active ? "Active" : "Inactive"}</Pill> },
    { key: "eff", header: "Effective", cell: (u) => <span className="text-[13px] text-muted">{u.effectiveFrom} → {u.effectiveTo}</span> },
    { key: "by", header: "Assigned by", cell: (u) => <span className="text-[13px] text-muted">{u.assignedBy}</span> },
    { key: "actions", header: "Actions", align: "center", cell: (u) => <RowAction icon="edit" onClick={() => setEditing(u)}>Edit</RowAction> },
  ];

  return (
    <>
      <PageHeader
        tabBar={
          <SegmentTabs<Tab>
            tabs={[{ key: "users", label: "Users", count: users.length }, { key: "matrix", label: "RBAC matrix" }]}
            active={tab}
            onChange={setTab}
          />
        }
        title="Users & Roles"
        description="Cross-region administration of users, roles and Woreda/region scopes (Appendix B/D). Every assignment is audited."
        actions={
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-brand-green px-3.5 text-[13.5px] font-semibold text-white transition-colors hover:bg-brand-green-dark"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add user
        </button>
        }
      />
      {notice && <Banner tone="success" onDismiss={() => setNotice(null)}>{notice}</Banner>}
      <Card className="overflow-hidden p-0 shadow-[0px_1px_3px_rgba(0,0,0,0.04)]">
        {tab === "users" ? (
          <>
            <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-ink">Users</h2>
                <p className="mt-0.5 text-[12.5px] text-ink-soft" title="A user acts only within role, active status, Woreda/region scope and function. Visibility does not grant edit rights.">
                  Deny-by-default — access only within role and scope.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:shrink-0">
                <SearchInput value={query} onChange={setQuery} placeholder={SEARCH_PLACEHOLDER} />

                <AdvancedFiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
              </div>
            </div>
            <DataTable itemLabel="users" columns={columns} rows={rows} rowKey={(u) => u.userId} minWidth="1000px" emptyTitle="No users match the selected filters" emptyHint="Clear a filter or try a different search." />
            <AdvancedFiltersDrawer
              isOpen={isFiltersOpen}
              onClose={() => setIsFiltersOpen(false)}
              fields={filterFields}
              filters={filters}
              onApply={(next) =>
                setFilters({
                  role: next.role ?? new Set(),
                  active: next.active ?? new Set(),
                  region: next.region ?? new Set(),
                  scope: next.scope ?? new Set(),
                })
              }
            />
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-[13.5px]">
              <thead className="border-y border-line bg-surface text-[13px] text-slate-700"><tr><th className="px-4 py-3 font-medium">Role</th><th className="px-4 py-3 font-medium">Can</th><th className="px-4 py-3 font-medium">Cannot (hidden / disabled)</th></tr></thead>
              <tbody>
                {PERMISSIONS.map((p) => (
                  <tr key={p.role} className="border-b border-line-soft align-top">
                    <td className="px-4 py-3"><Pill tone={ROLE_TONE[p.role]}>{ROLE_LABELS[p.role]}</Pill></td>
                    <td className="px-4 py-3 text-ink">{p.can}</td>
                    <td className="px-4 py-3 text-ink-soft">{p.cannot}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {adding && <UserFormModal mode="add" onClose={() => setAdding(false)} onSave={addUser} />}

      {editing && (
        <UserFormModal mode="edit" initial={editing} subtitle={`${editing.name} · ${editing.userId}`} onClose={() => setEditing(null)} onSave={saveEdit} />
      )}
    </>
  );
}
