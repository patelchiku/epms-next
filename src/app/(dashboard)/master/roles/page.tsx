"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { PERMISSION_MODULES, parsePermissions } from "@/lib/permissions";
import { Shield, Plus, Edit2, Trash2, Check, X, Loader2, Crown, Save } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

type Role = {
  id: number;
  name: string;
  active: boolean;
  permissions: string | null;
};

function PermissionMatrix({
  perms,
  onChange,
}: {
  perms: string[];
  onChange: (perms: string[]) => void;
}) {
  function toggle(key: string) {
    onChange(perms.includes(key) ? perms.filter((p) => p !== key) : [...perms, key]);
  }

  function toggleModule(moduleKey: string, actions: readonly { key: string }[]) {
    const keys = actions.map((a) => `${moduleKey}.${a.key}`);
    const allOn = keys.every((k) => perms.includes(k));
    if (allOn) {
      onChange(perms.filter((p) => !keys.includes(p)));
    } else {
      onChange([...perms.filter((p) => !keys.includes(p)), ...keys]);
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="text-left py-2 pr-4 font-semibold text-slate-600 w-40">Module</th>
            <th className="text-center py-2 px-2 font-semibold text-slate-500 text-xs w-16">All</th>
            {["view", "create/add", "edit", "delete", "manage", "approve"].map((h) => (
              <th key={h} className="text-center py-2 px-2 font-semibold text-slate-500 text-xs capitalize w-20">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {PERMISSION_MODULES.map((mod) => {
            const keys = mod.actions.map((a) => `${mod.key}.${a.key}`);
            const allOn = keys.every((k) => perms.includes(k));
            return (
              <tr key={mod.key} className="hover:bg-slate-50/50">
                <td className="py-2.5 pr-4 font-medium text-slate-700 text-xs">{mod.label}</td>
                <td className="py-2.5 px-2 text-center">
                  <button
                    type="button"
                    onClick={() => toggleModule(mod.key, mod.actions)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors ${
                      allOn
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "border-slate-300 hover:border-violet-400"
                    }`}
                  >
                    {allOn && <Check className="w-3 h-3" />}
                  </button>
                </td>
                {["view", "create", "edit", "delete", "manage", "add"].map((action) => {
                  const matchingAction = mod.actions.find(
                    (a) => a.key === action || (action === "create" && a.key === "create") || (action === "add" && a.key === "create") || (action === "manage" && a.key === "manage") || (action === "approve" && a.key === "manage")
                  );
                  // Map column headers to actual action keys
                  const colMap: Record<string, string> = {
                    view: "view",
                    "create/add": "create",
                    edit: "edit",
                    delete: "delete",
                    manage: "manage",
                    approve: "manage",
                  };
                  return null; // handled below
                })}
                {["view", "create", "edit", "delete", "manage"].map((action) => {
                  const act = mod.actions.find((a) => a.key === action);
                  const permKey = `${mod.key}.${action}`;
                  const isOn = perms.includes(permKey);
                  return (
                    <td key={action} className="py-2.5 px-2 text-center">
                      {act ? (
                        <button
                          type="button"
                          onClick={() => toggle(permKey)}
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors ${
                            isOn
                              ? "bg-violet-600 border-violet-600 text-white"
                              : "border-slate-300 hover:border-violet-400"
                          }`}
                        >
                          {isOn && <Check className="w-3 h-3" />}
                        </button>
                      ) : (
                        <span className="text-slate-200 text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [addingNew, setAddingNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>([]);

  async function loadRoles() {
    try {
      const res = await axios.get("/api/roles");
      setRoles(res.data);
    } catch {
      toast.error("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadRoles(); }, []);

  function startEdit(role: Role) {
    setEditingId(role.id);
    setEditName(role.name);
    setEditPerms(parsePermissions(role.permissions));
    setAddingNew(false);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit() {
    if (!editName.trim()) return toast.error("Role name is required");
    setSaving(true);
    try {
      await axios.put(`/api/roles/${editingId}`, { name: editName, permissions: editPerms });
      toast.success("Role updated");
      setEditingId(null);
      loadRoles();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRole(id: number) {
    if (!confirm("Deactivate this role?")) return;
    try {
      await axios.delete(`/api/roles/${id}`);
      toast.success("Role deactivated");
      loadRoles();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete");
    }
  }

  async function saveNew() {
    if (!newName.trim()) return toast.error("Role name is required");
    setSaving(true);
    try {
      await axios.post("/api/roles", { name: newName, permissions: newPerms });
      toast.success("Role created");
      setAddingNew(false);
      setNewName("");
      setNewPerms([]);
      loadRoles();
    } catch {
      toast.error("Failed to create role");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Header
        title="Roles & Permissions"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master", href: "/master/areas" },
          { label: "Roles & Permissions" },
        ]}
        actions={
          <button
            onClick={() => { setAddingNew(true); setEditingId(null); setNewName(""); setNewPerms([]); }}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" /> Add Role
          </button>
        }
      />

      <div className="p-6 space-y-4 max-w-5xl">

        {/* Admin role — always full access */}
        <div className="card p-5 border-l-4 border-amber-400">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Crown className="w-4.5 h-4.5 text-amber-600 w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800">Admin</p>
              <p className="text-xs text-slate-500">Full system access — all permissions granted</p>
            </div>
            <span className="badge bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Full Access
            </span>
          </div>
        </div>

        {/* Add new role form */}
        {addingNew && (
          <div className="card p-6 border-2 border-violet-200">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Plus className="w-4 h-4 text-violet-600" /> New Role
            </h3>
            <div className="mb-4">
              <label className="label">Role Name *</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="input max-w-xs"
                placeholder="e.g. Staff, Agent"
              />
            </div>
            <div className="mb-4">
              <p className="label mb-3">Permissions</p>
              <PermissionMatrix perms={newPerms} onChange={setNewPerms} />
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={saveNew} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Create Role
              </button>
              <button onClick={() => setAddingNew(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        )}

        {/* Existing roles */}
        {loading
          ? Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card p-5 animate-pulse h-16" />
            ))
          : roles.filter((r) => r.id !== 1 && r.active).map((role) => (
              <div key={role.id} className="card overflow-hidden">
                {/* Role header */}
                <div className="p-5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="flex-1">
                    {editingId === role.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="input max-w-xs text-sm py-1"
                      />
                    ) : (
                      <>
                        <p className="font-bold text-slate-800">{role.name}</p>
                        <p className="text-xs text-slate-500">
                          {parsePermissions(role.permissions).length} permissions assigned
                        </p>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {editingId === role.id ? (
                      <>
                        <button
                          onClick={saveEdit}
                          disabled={saving}
                          className="btn-primary py-1.5 px-3 text-xs gap-1"
                        >
                          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                          Save
                        </button>
                        <button onClick={cancelEdit} className="btn-secondary py-1.5 px-3 text-xs">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(role)}
                          className="btn-ghost p-1.5"
                          title="Edit permissions"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteRole(role.id)}
                          className="btn-ghost p-1.5 text-red-400 hover:text-red-600"
                          title="Deactivate role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Permission matrix (expanded when editing) */}
                {editingId === role.id && (
                  <div className="border-t border-slate-100 p-5 bg-slate-50/50">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
                      Permissions
                    </p>
                    <PermissionMatrix perms={editPerms} onChange={setEditPerms} />
                  </div>
                )}

                {/* Permission summary (collapsed) */}
                {editingId !== role.id && (
                  <div className="border-t border-slate-50 px-5 py-3 bg-slate-50/30">
                    <div className="flex flex-wrap gap-1.5">
                      {parsePermissions(role.permissions).length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No permissions assigned</span>
                      ) : (
                        parsePermissions(role.permissions).map((p) => (
                          <span
                            key={p}
                            className="inline-flex items-center gap-1 text-[10px] font-medium bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full"
                          >
                            <Check className="w-2.5 h-2.5" />
                            {p}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}
