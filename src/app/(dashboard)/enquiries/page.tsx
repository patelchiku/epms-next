"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { formatDate, parseMobiles } from "@/lib/utils";
import {
  Plus, Search, Phone, Eye, Edit, Trash2, MessageSquare,
  SlidersHorizontal, X, Target2, Crosshair
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

const FILTER_TABS = [
  { key: "",          label: "All" },
  { key: "today",     label: "Today" },
  { key: "tomorrow",  label: "Tomorrow" },
  { key: "pending",   label: "Pending" },
];

type MasterItem = { id: number; name: string };
type Filters = {
  statusId: string; sourceId: string; forType: string;
  propertyTypeId: string; bhkOfficeId: string; areaId: string;
  userId: string; dateFrom: string; dateTo: string;
  showDraft: boolean; showNonUse: boolean;
};

const EMPTY_FILTERS: Filters = {
  statusId: "", sourceId: "", forType: "", propertyTypeId: "",
  bhkOfficeId: "", areaId: "", userId: "", dateFrom: "", dateTo: "",
  showDraft: false, showNonUse: false,
};

function countActive(f: Filters): number {
  return [f.statusId, f.sourceId, f.forType, f.propertyTypeId, f.bhkOfficeId, f.areaId, f.userId, f.dateFrom, f.dateTo]
    .filter(Boolean).length + (f.showDraft ? 1 : 0) + (f.showNonUse ? 1 : 0);
}

export default function EnquiriesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.roleId === 1;

  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [filter, setFilter] = useState(searchParams.get("filter") ?? "");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(EMPTY_FILTERS);

  // Master data for dropdowns
  const [statuses, setStatuses] = useState<MasterItem[]>([]);
  const [sources, setSources] = useState<MasterItem[]>([]);
  const [propTypes, setPropTypes] = useState<MasterItem[]>([]);
  const [bhks, setBhks] = useState<MasterItem[]>([]);
  const [areas, setAreas] = useState<MasterItem[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const pageSize = 20;

  // Load master data once
  useEffect(() => {
    Promise.all([
      axios.get("/api/master/statuses"),
      axios.get("/api/master/sources"),
      axios.get("/api/master/property-types"),
      axios.get("/api/master/bhk-office"),
      axios.get("/api/master/areas"),
      ...(isAdmin ? [axios.get("/api/users?active=true")] : []),
    ]).then(([s, sr, pt, bh, ar, emp]) => {
      setStatuses(s.data);
      setSources(sr.data);
      setPropTypes(pt.data);
      setBhks(bh.data);
      setAreas(ar.data);
      if (emp) setEmployees(emp.data);
    }).catch(() => {});
  }, [isAdmin]);

  const fetchData = useCallback(async (attempt = 0) => {
    setLoading(true);
    try {
      const res = await axios.get("/api/enquiries", {
        params: {
          page, pageSize, search, filter,
          ...Object.fromEntries(
            Object.entries(appliedFilters).filter(([_, v]) => v !== "" && v !== false)
          ),
        },
      });
      setData(res.data.data);
      setTotal(res.data.total);
      setLoading(false);
    } catch {
      if (attempt < 2) setTimeout(() => fetchData(attempt + 1), 1500);
      else { toast.error("Failed to load enquiries"); setLoading(false); }
    }
  }, [page, search, filter, appliedFilters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleDelete(id: number) {
    if (!confirm("Delete this enquiry?")) return;
    try {
      await axios.delete(`/api/enquiries/${id}`);
      toast.success("Enquiry deleted");
      fetchData();
    } catch { toast.error("Failed to delete"); }
  }

  function applyFilters() {
    setAppliedFilters({ ...filters });
    setPage(1);
    setShowFilters(false);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
    setPage(1);
  }

  const activeCount = countActive(appliedFilters);
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

      <div className="p-6 space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* NFD tabs */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-sm">
            {FILTER_TABS.map((tab) => (
              <button key={tab.key} onClick={() => { setFilter(tab.key); setPage(1); }}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  filter === tab.key ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter toggle button */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-sm font-medium transition-all ${
              activeCount > 0 || showFilters
                ? "bg-violet-50 border-violet-200 text-violet-700"
                : "bg-white border-slate-200 text-slate-600 hover:border-violet-300"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>

          {/* Search */}
          <div className="relative ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, mobile..." className="input pl-9 w-64" />
          </div>
        </div>

        {/* Active filter chips */}
        {activeCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {appliedFilters.forType && (
              <Chip label={`For: ${appliedFilters.forType === "1" ? "Rent" : "Buy"}`}
                onRemove={() => { setAppliedFilters(f => ({ ...f, forType: "" })); setFilters(f => ({ ...f, forType: "" })); }} />
            )}
            {appliedFilters.statusId && <Chip label={`Status: ${statuses.find(s => s.id === Number(appliedFilters.statusId))?.name ?? "—"}`}
              onRemove={() => { setAppliedFilters(f => ({ ...f, statusId: "" })); setFilters(f => ({ ...f, statusId: "" })); }} />}
            {appliedFilters.sourceId && <Chip label={`Source: ${sources.find(s => s.id === Number(appliedFilters.sourceId))?.name ?? "—"}`}
              onRemove={() => { setAppliedFilters(f => ({ ...f, sourceId: "" })); setFilters(f => ({ ...f, sourceId: "" })); }} />}
            {appliedFilters.propertyTypeId && <Chip label={`Type: ${propTypes.find(s => s.id === Number(appliedFilters.propertyTypeId))?.name ?? "—"}`}
              onRemove={() => { setAppliedFilters(f => ({ ...f, propertyTypeId: "" })); setFilters(f => ({ ...f, propertyTypeId: "" })); }} />}
            {appliedFilters.bhkOfficeId && <Chip label={`BHK: ${bhks.find(s => s.id === Number(appliedFilters.bhkOfficeId))?.name ?? "—"}`}
              onRemove={() => { setAppliedFilters(f => ({ ...f, bhkOfficeId: "" })); setFilters(f => ({ ...f, bhkOfficeId: "" })); }} />}
            {appliedFilters.areaId && <Chip label={`Area: ${areas.find(s => s.id === Number(appliedFilters.areaId))?.name ?? "—"}`}
              onRemove={() => { setAppliedFilters(f => ({ ...f, areaId: "" })); setFilters(f => ({ ...f, areaId: "" })); }} />}
            {appliedFilters.dateFrom && <Chip label={`From: ${appliedFilters.dateFrom}`}
              onRemove={() => { setAppliedFilters(f => ({ ...f, dateFrom: "" })); setFilters(f => ({ ...f, dateFrom: "" })); }} />}
            {appliedFilters.dateTo && <Chip label={`To: ${appliedFilters.dateTo}`}
              onRemove={() => { setAppliedFilters(f => ({ ...f, dateTo: "" })); setFilters(f => ({ ...f, dateTo: "" })); }} />}
            {appliedFilters.showDraft && <Chip label="Drafts" onRemove={() => { setAppliedFilters(f => ({ ...f, showDraft: false })); setFilters(f => ({ ...f, showDraft: false })); }} />}
            {appliedFilters.showNonUse && <Chip label="Non-Use" onRemove={() => { setAppliedFilters(f => ({ ...f, showNonUse: false })); setFilters(f => ({ ...f, showNonUse: false })); }} />}
            <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-red-500 flex items-center gap-1 ml-1">
              <X className="w-3 h-3" /> Clear all
            </button>
          </div>
        )}

        {/* Filter panel */}
        {showFilters && (
          <div className="card p-4 border border-violet-100 bg-violet-50/30">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <FilterSelect label="For" value={filters.forType} onChange={v => setFilters(f => ({ ...f, forType: v }))}>
                <option value="">All</option>
                <option value="1">Rent</option>
                <option value="2">Buy</option>
              </FilterSelect>
              <FilterSelect label="Status" value={filters.statusId} onChange={v => setFilters(f => ({ ...f, statusId: v }))}>
                <option value="">All statuses</option>
                {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </FilterSelect>
              <FilterSelect label="Source" value={filters.sourceId} onChange={v => setFilters(f => ({ ...f, sourceId: v }))}>
                <option value="">All sources</option>
                {sources.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </FilterSelect>
              <FilterSelect label="Property Type" value={filters.propertyTypeId} onChange={v => setFilters(f => ({ ...f, propertyTypeId: v }))}>
                <option value="">All types</option>
                {propTypes.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </FilterSelect>
              <FilterSelect label="BHK / Office" value={filters.bhkOfficeId} onChange={v => setFilters(f => ({ ...f, bhkOfficeId: v }))}>
                <option value="">All BHK</option>
                {bhks.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </FilterSelect>
              <FilterSelect label="Area" value={filters.areaId} onChange={v => setFilters(f => ({ ...f, areaId: v }))}>
                <option value="">All areas</option>
                {areas.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </FilterSelect>
              {isAdmin && (
                <FilterSelect label="Employee" value={filters.userId} onChange={v => setFilters(f => ({ ...f, userId: v }))}>
                  <option value="">All employees</option>
                  {employees.map((e: any) => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </FilterSelect>
              )}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Added From</label>
                <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                  className="input text-sm py-1.5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Added To</label>
                <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                  className="input text-sm py-1.5" />
              </div>
            </div>
            {/* Toggles */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-violet-100">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={filters.showDraft} onChange={e => setFilters(f => ({ ...f, showDraft: e.target.checked }))}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                Include Drafts
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" checked={filters.showNonUse} onChange={e => setFilters(f => ({ ...f, showNonUse: e.target.checked }))}
                  className="rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                Include Non-Use
              </label>
              <div className="ml-auto flex gap-2">
                <button onClick={() => { setFilters(EMPTY_FILTERS); }} className="btn-secondary text-sm py-1.5 px-3">Reset</button>
                <button onClick={applyFilters} className="btn-primary text-sm py-1.5 px-4">Apply Filters</button>
              </div>
            </div>
          </div>
        )}

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
                  <th className="table-th w-28 text-right">Actions</th>
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
                  <tr><td colSpan={8} className="text-center py-16 text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      <MessageSquare className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="font-medium">No enquiries found</p>
                  </td></tr>
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
                          <Link
                            href={`/match?forType=${row.forType}&areaId=${row.areaId || ""}&bhkOfficeId=${row.bhkOfficeId || ""}&propertyTypeId=${row.propertyTypeId || ""}&from=enquiry&refId=${row.id}`}
                            className="btn-ghost p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            title="Find matching properties"
                          >
                            <Crosshair className="w-3.5 h-3.5" />
                          </Link>
                          <Link href={`/enquiries/${row.id}`} className="btn-ghost p-1.5" title="View"><Eye className="w-3.5 h-3.5" /></Link>
                          <Link href={`/enquiries/${row.id}/edit`} className="btn-ghost p-1.5" title="Edit"><Edit className="w-3.5 h-3.5" /></Link>
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

          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              {total > 0 ? `${(page-1)*pageSize+1}–${Math.min(page*pageSize,total)} of ${total} records` : "No records"}
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-7 h-7 rounded-lg text-xs font-medium transition-all ${
                    p === page ? "bg-violet-600 text-white" : "text-slate-500 hover:bg-slate-200"
                  }`}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-violet-900"><X className="w-3 h-3" /></button>
    </span>
  );
}

function FilterSelect({ label, value, onChange, children }: {
  label: string; value: string; onChange: (v: string) => void; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)} className="input text-sm py-1.5">
        {children}
      </select>
    </div>
  );
}
