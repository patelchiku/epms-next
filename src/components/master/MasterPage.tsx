"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Plus, Edit2, Trash2, Check, X, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

type Props = {
  title: string;
  resource: string;
  nameField?: string;
  breadcrumbLabel?: string;
};

export default function MasterPage({ title, resource, nameField = "name", breadcrumbLabel }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    try {
      const res = await axios.get(`/api/master/${resource}?active=false`);
      setItems(res.data);
    } catch { toast.error("Failed to load"); }
    finally { setLoading(false); }
  }

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const payload: any = { active: true };
      payload[nameField] = newName.trim();
      await axios.post(`/api/master/${resource}`, payload);
      toast.success("Added successfully");
      setNewName(""); setShowAdd(false);
      fetchData();
    } catch { toast.error("Failed to add"); }
    finally { setAdding(false); }
  }

  async function handleEdit(id: number) {
    if (!editVal.trim()) return;
    try {
      const payload: any = {};
      payload[nameField] = editVal.trim();
      await axios.put(`/api/master/${resource}/${id}`, payload);
      toast.success("Updated"); setEditId(null);
      fetchData();
    } catch { toast.error("Failed to update"); }
  }

  async function handleToggle(id: number, current: boolean) {
    try {
      await axios.put(`/api/master/${resource}/${id}`, { active: !current });
      toast.success(current ? "Deactivated" : "Activated");
      fetchData();
    } catch { toast.error("Failed"); }
  }

  const active = items.filter((i) => i.active);
  const inactive = items.filter((i) => !i.active);

  return (
    <div>
      <Header
        title={title}
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Master" },
          { label: breadcrumbLabel || title },
        ]}
        actions={
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add {title.replace(/s$/, "")}
          </button>
        }
      />

      <div className="p-6 max-w-3xl space-y-5">

        {/* Add form */}
        {showAdd && (
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-4">Add New {title.replace(/s$/, "")}</h3>
            <div className="flex gap-2">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder={`Enter ${title.replace(/s$/, "").toLowerCase()} name`}
                className="input flex-1"
                autoFocus
              />
              <button onClick={handleAdd} disabled={adding} className="btn-primary px-5">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Save
              </button>
              <button onClick={() => { setShowAdd(false); setNewName(""); }} className="btn-secondary px-3">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Active items */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800">{title}</h2>
            <span className="badge badge-green">{active.length} active</span>
          </div>

          {loading ? (
            <div className="p-5 space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : active.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <p className="font-medium">No {title.toLowerCase()} yet</p>
              <p className="text-sm mt-1">Click "Add" to create the first one</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {active.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/80 group transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-violet-600">{item[nameField]?.charAt(0)?.toUpperCase()}</span>
                  </div>

                  {editId === item.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleEdit(item.id)}
                        className="input flex-1 py-1.5 text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleEdit(item.id)} className="btn-primary py-1.5 px-3 text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setEditId(null)} className="btn-secondary py-1.5 px-3 text-xs">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 font-medium text-slate-800 text-sm">{item[nameField]}</span>
                      <span className="text-xs text-slate-400 font-mono">#{item.id}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditId(item.id); setEditVal(item[nameField]); }}
                          className="btn-ghost p-1.5 text-slate-500 hover:text-violet-600"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggle(item.id, item.active)}
                          className="btn-ghost p-1.5 text-slate-500 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inactive items */}
        {inactive.length > 0 && (
          <div className="card overflow-hidden opacity-60 hover:opacity-100 transition-opacity">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-500">Inactive</h3>
              <span className="badge badge-slate">{inactive.length}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {inactive.map((item) => (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3 group">
                  <span className="flex-1 text-sm text-slate-400 line-through">{item[nameField]}</span>
                  <button onClick={() => handleToggle(item.id, item.active)}
                    className="btn-ghost text-xs py-1 px-2 opacity-0 group-hover:opacity-100">Restore</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
