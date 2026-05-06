"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { formatDate, parseMobiles } from "@/lib/utils";
import { Plus, Search, Filter, Phone, Eye, Edit, Trash2, MessageSquare } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const FILTER_TABS = [
  { key: "",        label: "All" },
  { key: "today",   label: "Today" },
  { key: "tomorrow",label: "Tomorrow" },
  { key: "pending", label: "Pending" },
];

export default function EnquiriesPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const fetchData = useCallback(async (attempt = 0) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/enquiries", {
        params: { page, pageSize, search, filter },
      });
      setData(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    } catch {
      if (attempt < 2) {
        setTimeout(() => fetchData(attempt + 1), 1500);
      } else {
        toast.error("Failed to load enquiries");
        setLoading(false);
      }
    }
  }, [page, search, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this enquiry?")) return;
    try {
      await axios.delete(`/api/enquiries/${id}`);
      toast.success("Enquiry deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <Header
        title="Enquiries"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Enquiries" }]}
        actions={
          <Link href="/enquiries/add" className="btn-primary">
            <Plus className="w-4 h-4" /> Add Enquiry
          </Link>
        }
      />

      <div className="p-6 space-y-5">
        {/* Filter tabs + search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setFilter(tab.key); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.key
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, mobile..."
              className="input pl-9 w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="table-th w-10">#</th>
                  <th className="table-th">Client</th>
                  <th className="table-th">Mobile</th>
                  <th className="table-th">Type / For</th>
                  <th className="table-th">Source</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">NFD</th>
                  <th className="table-th w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <td key={j} className="table-td">
                          <div className="h-4 bg-slate-100 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400">
                      <FileIcon />
                      <p className="mt-2 font-medium">No enquiries found</p>
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr key={row.id} className="hover:bg-violet-50/30 transition-colors group">
                      <td className="table-td text-slate-400 font-mono text-xs">{row.id}</td>
                      <td className="table-td">
                        <Link href={`/enquiries/${row.id}`}
                          className="font-semibold text-slate-800 hover:text-violet-600 transition-colors">
                          {row.clientName}
                        </Link>
                        {row.user && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            By {row.user.firstName} {row.user.lastName}
                          </p>
                        )}
                      </td>
                      <td className="table-td">
                        {parseMobiles(row.mobileNos).map((m: string, i: number) => (
                          <a key={i} href={`tel:${m}`}
                            className="flex items-center gap-1 text-slate-600 hover:text-violet-600 transition-colors text-xs">
                            <Phone className="w-3 h-3" />{m}
                          </a>
                        ))}
                      </td>
                      <td className="table-td">
                        <span className="font-medium text-slate-700">{row.propertyType?.name || "—"}</span>
                        <span className={`ml-2 badge ${row.forType === 1 ? "badge-blue" : "badge-orange"}`}>
                          {row.forType === 1 ? "Rent" : "Buy"}
                        </span>
                      </td>
                      <td className="table-td text-slate-500">{row.source?.name || "—"}</td>
                      <td className="table-td">
                        {row.status ? (
                          <span className="badge badge-green">{row.status.name}</span>
                        ) : (
                          <span className="badge badge-slate">No Status</span>
                        )}
                      </td>
                      <td className="table-td">
                        {row.nfd ? (
                          <span className={`text-xs font-medium ${new Date(row.nfd) < new Date() ? "text-red-500" : "text-slate-600"}`}>
                            {formatDate(row.nfd)}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="table-td">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/enquiries/${row.id}`} className="btn-ghost p-1.5" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/enquiries/${row.id}/edit`} className="btn-ghost p-1.5" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => handleDelete(row.id)} className="btn-ghost p-1.5 hover:text-red-500" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              {total > 0 ? `${(page-1)*pageSize+1}–${Math.min(page*pageSize,total)} of ${total} records` : "No records"}
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    p === page ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-slate-200"
                  }`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto">
      <MessageSquare className="w-6 h-6 text-slate-400" />
    </div>
  );
}
