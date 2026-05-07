"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { formatDate } from "@/lib/utils";
import { Plus, Handshake, Eye, Edit } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function DealsPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const fetchData = useCallback(async (attempt = 0) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/deals", { params: { page, pageSize } });
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
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <Header
        title="Property Deals"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Property Deals" }]}
        actions={<Link href="/deals/add" className="btn-primary"><Plus className="w-4 h-4" />Add Deal</Link>}
      />
      <div className="p-6 space-y-5">
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-th">#</th>
                  <th className="table-th">Property</th>
                  <th className="table-th">Owner</th>
                  <th className="table-th">Buyer</th>
                  <th className="table-th">Deal Amount</th>
                  <th className="table-th">Deal Date</th>
                  <th className="table-th">Employee</th>
                  <th className="table-th">Payments</th>
                  <th className="table-th text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 9 }).map((_, j) => (
                    <td key={j} className="table-td"><div className="h-4 bg-slate-100 rounded animate-pulse" /></td>
                  ))}</tr>
                )) : data.length === 0 ? (
                  <tr><td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      <Handshake className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="font-medium">No deals yet</p>
                  </td></tr>
                ) : data.map((row) => (
                  <tr key={row.id} className="hover:bg-violet-50/30 transition-colors group">
                    <td className="table-td text-slate-400 font-mono text-xs">{row.id}</td>
                    <td className="table-td">
                      <p className="font-semibold text-slate-800">{row.propertyName || "—"}</p>
                      <p className="text-xs text-slate-400">{row.flatOffice}</p>
                    </td>
                    <td className="table-td">
                      <p className="font-medium">{row.ownerName || "—"}</p>
                      <p className="text-xs text-slate-400">{row.ownerNumber}</p>
                    </td>
                    <td className="table-td">
                      <p className="font-medium">{row.buyerName || "—"}</p>
                      <p className="text-xs text-slate-400">{row.buyerNumber}</p>
                    </td>
                    <td className="table-td font-bold text-emerald-600">₹{row.dealAmount || "—"}</td>
                    <td className="table-td text-slate-500">{row.dealDate || "—"}</td>
                    <td className="table-td text-slate-600">
                      {row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : "—"}
                    </td>
                    <td className="table-td">
                      <span className="badge badge-violet">{row.payments?.length || 0} payments</span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/deals/${row.id}`} className="btn-ghost p-1.5" title="View"><Eye className="w-3.5 h-3.5" /></Link>
                        <Link href={`/deals/${row.id}/edit`} className="btn-ghost p-1.5" title="Edit"><Edit className="w-3.5 h-3.5" /></Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">{total} deals</p>
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
