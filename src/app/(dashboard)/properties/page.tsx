"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { formatDate, formatPrice } from "@/lib/utils";
import { Plus, Search, Eye, Edit, Trash2, Home, Crosshair } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export default function PropertiesPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [forType, setForType] = useState("");
  const [loading, setLoading] = useState(true);
  const pageSize = 20;
  const router = useRouter();

  const fetchData = useCallback(async (attempt = 0) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/properties", { params: { page, pageSize, search, forType: forType || undefined } });
      setData(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    } catch {
      if (attempt < 2) {
        setTimeout(() => fetchData(attempt + 1), 1500);
      } else {
        toast.error("Failed to load");
        setLoading(false);
      }
    }
  }, [page, search, forType]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this property?")) return;
    await axios.delete(`/api/properties/${id}`);
    toast.success("Deleted");
    fetchData();
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <Header
        title="Properties"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Properties" }]}
        actions={<Link href="/properties/add" className="btn-primary"><Plus className="w-4 h-4" /> Add Property</Link>}
      />

      <div className="p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            {[{ key: "", label: "All" }, { key: "1", label: "Rent" }, { key: "2", label: "Buy" }].map((t) => (
              <button key={t.key} onClick={() => { setForType(t.key); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${forType === t.key ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search owner, address..." className="input pl-9 w-64" />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-th">#</th>
                  <th className="table-th">Property</th>
                  <th className="table-th">Owner</th>
                  <th className="table-th">Type / BHK</th>
                  <th className="table-th">Price</th>
                  <th className="table-th">Area</th>
                  <th className="table-th">Status</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="table-td"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                    ))}</tr>
                  ))
                ) : data.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      <Home className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="font-medium">No properties found</p>
                  </td></tr>
                ) : data.map((row) => (
                  <tr key={row.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="table-td text-slate-400 font-mono text-xs">{row.id}</td>
                    <td className="table-td">
                      <Link href={`/properties/${row.id}`} className="font-semibold text-slate-800 hover:text-violet-600 transition-colors">
                        {row.building?.name || "—"} {row.flatNumber ? `- ${row.flatNumber}` : ""}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">{row.address || "No address"}</p>
                    </td>
                    <td className="table-td">
                      <p className="font-medium">{row.ownerName || "—"}</p>
                      <p className="text-xs text-slate-400">{row.ownerMobile || ""}</p>
                    </td>
                    <td className="table-td">
                      <span className="font-medium">{row.propertyType?.name || "—"}</span>
                      {row.bhkOffice && <span className="ml-2 badge badge-slate">{row.bhkOffice.name}</span>}
                      <div className="mt-1">
                        <span className={`badge ${row.forType === 1 ? "badge-blue" : "badge-orange"}`}>
                          {row.forType === 1 ? "Rent" : "Buy"}
                        </span>
                      </div>
                    </td>
                    <td className="table-td font-semibold text-slate-800">{formatPrice(row.price)}</td>
                    <td className="table-td text-slate-500">{row.area?.name || "—"}</td>
                    <td className="table-td">
                      {row.status ? <span className="badge badge-green">{row.status.name}</span> : <span className="badge badge-slate">—</span>}
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => router.push(`/match?forType=${row.forType}&areaId=${row.areaId || ""}&bhkOfficeId=${row.bhkOfficeId || ""}&propertyTypeId=${row.propertyTypeId || ""}&from=property&refId=${row.id}`)}
                          className="btn-ghost p-1.5 hover:text-violet-600" title="Find matching enquiries"
                        ><Crosshair className="w-3.5 h-3.5" /></button>
                        <Link href={`/properties/${row.id}`} className="btn-ghost p-1.5"><Eye className="w-3.5 h-3.5" /></Link>
                        <Link href={`/properties/${row.id}/edit`} className="btn-ghost p-1.5"><Edit className="w-3.5 h-3.5" /></Link>
                        <button onClick={() => handleDelete(row.id)} className="btn-ghost p-1.5 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">{total} properties</p>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${p === page ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-slate-200"}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
