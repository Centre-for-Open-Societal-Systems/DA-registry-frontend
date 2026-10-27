"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dropdown } from "@/components/ui/Dropdown";
import { FormField } from "@/components/ui/FormField";
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  ROLE_CATALOGUE,
  emptyPermissions,
  type PermissionAction,
  type PermissionSet,
  type SuperAdminRole,
} from "@/features/superadmin";

interface RoleFormModalProps {
  mode: "add" | "edit";
  initial?: SuperAdminRole;
  /** Names already in the directory, so Add only offers roles that are not there yet. */
  takenNames: string[];
  onClose: () => void;
  onSave: (name: string, permissions: Record<string, PermissionSet>) => void;
}

const TITLES = { add: "Add Role", edit: "Edit Role" };
const COLUMN_LABELS: Record<PermissionAction, string> = { read: "Read", write: "Write", edit: "Edit", delete: "Delete" };

// One form for Add and Edit, so both always show the same role field and permissions grid.
export function RoleFormModal({ mode, initial, takenNames, onClose, onSave }: RoleFormModalProps) {
  const [role, setRole] = useState(initial?.name ?? "");
  const [permissions, setPermissions] = useState<Record<string, PermissionSet>>(initial?.permissions ?? emptyPermissions());
  const [error, setError] = useState<string | undefined>();

  const roleOptions = ROLE_CATALOGUE.filter((n) => n === initial?.name || !takenNames.includes(n));

  const setPermission = (module: string, action: PermissionAction, checked: boolean) =>
    setPermissions((prev) => ({ ...prev, [module]: { ...prev[module], [action]: checked } }));

  const submit = () => {
    if (!role) return setError("Select the role");
    onSave(role, permissions);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={TITLES[mode]}
      subtitle="Manage role and their permissions"
      size="xl"
      className="max-w-[890px]"
      bodyClassName="px-4 py-5 sm:px-6"
      footer={
        <>
          <Button variant="outline" onClick={onClose} className="px-6">Cancel</Button>
          <Button variant="brand" onClick={submit} className="px-6">Submit</Button>
        </>
      }
    >
      <h3 className="mb-4 text-[16px] font-semibold text-ink">Role details</h3>
      <FormField label="Role" htmlFor="role-name" required hint={error} hintTone="error" className="sm:max-w-[33%] [&>label]:text-[14px] [&>label]:font-medium">
        <Dropdown id="role-name" value={role} placeholder="Select role" options={roleOptions} onChange={(v) => { setRole(v); setError(undefined); }} />
      </FormField>

      <h3 className="mb-4 mt-6 text-[16px] font-semibold text-ink">Permissions</h3>
      <div className="overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[560px] border-collapse text-left text-[14px]">
          <thead>
            <tr className="border-b border-line bg-surface text-[13px] font-semibold text-slate-700">
              <th className="px-6 py-3 font-semibold">Permission Module</th>
              {PERMISSION_ACTIONS.map((a) => (
                <th key={a} className="px-4 py-3 text-center font-semibold">{COLUMN_LABELS[a]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSION_MODULES.map((module) => (
              <tr key={module} className="border-b border-line-soft last:border-b-0">
                <td className="px-6 py-3.5 font-semibold text-slate-700">{module}</td>
                {PERMISSION_ACTIONS.map((action) => (
                  <td key={action} className="px-4 py-3.5">
                    <span className="flex justify-center">
                      <Checkbox
                        aria-label={`${COLUMN_LABELS[action]} access to ${module}`}
                        checked={permissions[module]?.[action] ?? false}
                        onChange={(e) => setPermission(module, action, e.target.checked)}
                      />
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
