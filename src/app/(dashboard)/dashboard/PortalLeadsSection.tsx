"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ExternalLink, Loader2, Plus, Search, X, RefreshCw } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

type Portal = "magicbricks" | "housing" | "99acres";

type Lead = {
  id?: number;
  name: string;
  mobile: string;
  email: string;
  remark: string;
  date: string;
  exists: boolean;
  // MB specific
  address?: string;
  city?: string;
  // Housing specific
  segment?: string;
  apartment?: string;
  // 99acres specific
  user?: string;
};

const PORTALS: { key: Portal; label: string; color: string; accent: string }[] = [
  { key: "magicbricks", label: "MagicBricks", color: "bg-red-50 border-red-200",   accent: "text-red-600" },
  { key: "housing",     label: "Housing.com",  color: "bg-blue-50 border-blue-200", accent: "text-blue-600" },
  { key: "99acres",     label: "99 Acres",     color: "bg-orange-50 border-orange-200", accent: "text-orange-600" },
];

export default function PortalLeadsSection() {
  const [counts, setCounts] = useState({ mbCount: 0, housingCount: 0, acresCount: 0 });
  const [countsLoaded, setCountsLoaded] = useState(false);
  const [active, setActive] = useState<Portal | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async (attempt = 0) => {
      try {
        const res = await axios.get("/api/leads/count");
        setCounts(res.data);
        setCountsLoaded(true);
      } catch {
        if (attempt < 2) setTimeout(() => load(attempt + 1), 1500);
        else setCountsLoaded(true);
      }
    };
    load();
  }, []);

  const fetchLeads = useCallback(async (portal: Portal) => {
    setActive(portal);
    setLeads([]);
    setError(null);
    setLoading(true);
    try {
      const res = await axios.get(`/api/leads/${portal}`);
      if (res.data.error) setError(res.data.error);
      setLeads(res.data.leads ?? []);
    } catch {
      setError("Failed to load leads. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function removeHousingLead(id: number) {
    try {
      await axios.delete("/api/leads/housing", { data: { id } });
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setCounts((c) => ({ ...c, housingCount: Math.max(0, c.housingCount - 1) }));
      toast.success("Lead removed");
    } catch { toast.error("Failed to remove"); }
  }

  async function remove99Lead(id: number) {
    try {
      await axios.delete("/api/leads/99acres", { data: { id } });
      setLeads((prev) => prev.filter((l) => l.id !== id));
      setCounts((c) => ({ ...c, acresCount: Math.max(0, c.acresCount - 1) }));
      toast.success("Lead removed");
    } catch { toast.error("Failed to remove"); }
  }

  const countFor = (p: Portal) =>
    p === "magicbricks" ? counts.mbCount : p === "housing" ? counts.housingCount : counts.acresCount;

  return (
    <div className="space-y-4">
      {/* Portal tiles */}
      <div className="grid grid-cols-3 gap-4">
        {PORTALS.map((p) => (
          <button
            key={p.key}
            onClick={() => active === p.key ? setActive(null) : fetchLeads(p.key)}
            className={`rounded-xl border p-5 text-left transition-all hover:shadow-md active:scale-[0.98] ${p.color} ${active === p.key ? "ring-2 ring-violet-400 shadow-md" : ""}`}
          >
            <p className={`text-3xl font-bold ${p.accent}`}>
              {countsLoaded ? countFor(p.key) : <span className="text-slate-300">—</span>}
            </p>
            <p className="text-sm font-medium text-slate-600 mt-1">{p.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">Click to view leads</p>
          </button>
        ))}
      </div>

      {/* Leads panel */}
      {active && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-slate-800">
                {PORTALS.find((p) => p.key === active)?.label} Leads
              </h3>
              {!loading && <span className="badge badge-slate">{leads.length} leads</span>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => fetchLeads(active)} className="btn-ghost p-1.5" title="Refresh">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setActive(null)} className="btn-ghost p-1.5">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Fetching leads…</span>
            </div>
          ) : error ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">{error}</p>
              {error.includes("not configured") && (
                <Link href="/settings" className="mt-2 inline-flex items-center gap-1 text-xs text-violet-600 hover:underline">
                  <ExternalLink className="w-3 h-3" /> Go to Settings
                </Link>
              )}
            </div>
          ) : leads.length === 0 ? (
            <div className="py-10 text-center text-slate-400">
              <p className="text-sm">No new leads found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="table-th">#</th>
                    <th className="table-th">Date</th>
                    <th className="table-th">Name</th>
                    <th className="table-th">Mobile</th>
                    <th className="table-th">Email</th>
                    <th className="table-th">Remark</th>
                    {active === "magicbricks" && <th className="table-th">City</th>}
                    {active === "housing" && <><th className="table-th">Segment</th><th className="table-th">Property</th></>}
                    <th className="table-th text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {leads.map((lead, i) => (
                    <tr key={i} className="hover:bg-violet-50/30 transition-colors group">
                      <td className="table-td text-slate-400 text-xs">{i + 1}</td>
                      <td className="table-td text-slate-500 text-xs whitespace-nowrap">
                        {lead.date ? new Date(lead.date).toLocaleDateString("en-IN") : "—"}
                      </td>
                      <td className="table-td font-medium text-slate-800">{lead.name || "—"}</td>
                      <td className="table-td font-mono text-xs text-slate-700">
                        <a href={`tel:${lead.mobile}`} className="hover:text-violet-600">{lead.mobile || "—"}</a>
                      </td>
                      <td className="table-td text-slate-500 text-xs max-w-[140px] truncate">{lead.email || "—"}</td>
                      <td className="table-td text-slate-500 text-xs max-w-[200px] truncate" title={lead.remark}>{lead.remark || "—"}</td>
                      {active === "magicbricks" && <td className="table-td text-slate-500 text-xs">{lead.city || "—"}</td>}
                      {active === "housing" && (
                        <>
                          <td className="table-td text-slate-500 text-xs">{lead.segment || "—"}</td>
                          <td className="table-td text-slate-500 text-xs">{lead.apartment || "—"}</td>
                        </>
                      )}
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-1">
                          {lead.exists ? (
                            <Link
                              href={`/enquiries?search=${lead.mobile}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                            >
                              <Search className="w-3 h-3" /> Exists
                            </Link>
                          ) : (
                            <Link
                              href={`/enquiries/add?name=${encodeURIComponent(lead.name)}&mobile=${encodeURIComponent(lead.mobile)}&email=${encodeURIComponent(lead.email)}&remark=${encodeURIComponent(lead.remark)}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            >
                              <Plus className="w-3 h-3" /> Add
                            </Link>
                          )}
                          {(active === "housing" && lead.id) && (
                            <button
                              onClick={() => removeHousingLead(lead.id!)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove lead"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {(active === "99acres" && lead.id) && (
                            <button
                              onClick={() => remove99Lead(lead.id!)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Remove lead"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
