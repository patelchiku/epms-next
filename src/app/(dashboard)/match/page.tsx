"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { Crosshair, Search, Home, FileText, X, RotateCcw } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { formatPrice, formatDate } from "@/lib/utils";
import { Suspense } from "react";

type MasterItem = { id: number; name: string };

type MatchProperty = {
  id: number; forType: number; ownerName: string; ownerMobile: string; price: string | null;
  address: string | null;
  building: { name: string } | null;
  flatNumber: string | null;
  propertyType: { name: string } | null;
  bhkOffice: { name: string } | null;
  area: { name: string } | null;
  status: { name: string } | null;
};

type MatchEnquiry = {
  id: number; name: string; mobile: string; email: string | null; forType: number;
  propertyType: { name: string } | null;
  bhkOffice: { name: string } | null;
  area: { name: string } | null;
  status: { name: string } | null;
  budget: string | null;
  createdAt: string;
  user: { firstName: string; lastName: string } | null;
};

function MatchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [forType, setForType] = useState(searchParams.get("forType") || "");
  const [areaId, setAreaId] = useState(searchParams.get("areaId") || "");
  const [bhkOfficeId, setBhkOfficeId] = useState(searchParams.get("bhkOfficeId") || "");
  const [propertyTypeId, setPropertyTypeId] = useState(searchParams.get("propertyTypeId") || "");
  const [budgetId, setBudgetId] = useState(searchParams.get("budgetId") || "");

  const [areas, setAreas] = useState<MasterItem[]>([]);
  const [bhks, setBhks] = useState<MasterItem[]>([]);
  const [propTypes, setPropTypes] = useState<MasterItem[]>([]);
  const [budgets, setBudgets] = useState<MasterItem[]>([]);

  const [properties, setProperties] = useState<MatchProperty[]>([]);
  const [enquiries, setEnquiries] = useState<MatchEnquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<"properties" | "enquiries">("properties");

  const fromSource = searchParams.get("from");
  const refId = searchParams.get("refId");

  useEffect(() => {
    async function loadMaster() {
      try {
        const [a, b, p, bu] = await Promise.all([
          axios.get("/api/master/areas"),
          axios.get("/api/master/bhk-office"),
          axios.get("/api/master/property-types"),
          axios.get("/api/master/budget"),
        ]);
        setAreas(a.data);
        setBhks(b.data);
        setPropTypes(p.data);
        setBudgets(bu.data);
      } catch {
        toast.error("Failed to load filters");
      }
    }
    loadMaster();
  }, []);

  // Auto-search if URL has params (came from enquiry/property row)
  useEffect(() => {
    if (searchParams.get("forType") || searchParams.get("areaId") || searchParams.get("bhkOfficeId") || searchParams.get("propertyTypeId")) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areas, bhks, propTypes]);

  const handleSearch = useCallback(async () => {
    if (!forType && !areaId && !bhkOfficeId && !propertyTypeId && !budgetId) {
      toast.error("Please select at least one search criteria");
      return;
    }
    setLoading(true);
    setSearched(true);
    try {
      const res = await axios.get("/api/match", {
        params: {
          forType: forType || undefined,
          areaId: areaId || undefined,
          bhkOfficeId: bhkOfficeId || undefined,
          propertyTypeId: propertyTypeId || undefined,
          budgetId: budgetId || undefined,
        },
      });
      setProperties(res.data.properties ?? []);
      setEnquiries(res.data.enquiries ?? []);
    } catch {
      toast.error("Search failed");
    } finally {
      setLoading(false);
    }
  }, [forType, areaId, bhkOfficeId, propertyTypeId, budgetId]);

  function handleReset() {
    setForType("");
    setAreaId("");
    setBhkOfficeId("");
    setPropertyTypeId("");
    setBudgetId("");
    setProperties([]);
    setEnquiries([]);
    setSearched(false);
    router.replace("/match");
  }

  const backHref = fromSource === "enquiry" ? `/enquiries${refId ? `/${refId}` : ""}` : fromSource === "property" ? `/properties${refId ? `/${refId}` : ""}` : undefined;

  return (
    <div>
      <Header
        title="Match Search"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          ...(backHref ? [{ label: fromSource === "enquiry" ? "Enquiries" : "Properties", href: backHref }] : []),
          { label: "Match Search" },
        ]}
      />

      <div className="p-6 space-y-5">
        {/* Criteria card */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
              <Crosshair className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-800 text-sm">Search Criteria</h2>
              <p className="text-xs text-slate-400">Select any combination to find matching properties & enquiries</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* For Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">For</label>
              <select value={forType} onChange={(e) => setForType(e.target.value)} className="input text-sm">
                <option value="">All</option>
                <option value="1">Rent</option>
                <option value="2">Buy</option>
              </select>
            </div>

            {/* Area */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Area</label>
              <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="input text-sm">
                <option value="">Any</option>
                {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            {/* BHK */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">BHK / Office</label>
              <select value={bhkOfficeId} onChange={(e) => setBhkOfficeId(e.target.value)} className="input text-sm">
                <option value="">Any</option>
                {bhks.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>

            {/* Property Type */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Property Type</label>
              <select value={propertyTypeId} onChange={(e) => setPropertyTypeId(e.target.value)} className="input text-sm">
                <option value="">Any</option>
                {propTypes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* Budget */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-500">Budget</label>
              <select value={budgetId} onChange={(e) => setBudgetId(e.target.value)} className="input text-sm">
                <option value="">Any</option>
                {budgets.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button onClick={handleSearch} disabled={loading}
              className="btn-primary flex items-center gap-2 px-5">
              <Search className="w-4 h-4" />
              {loading ? "Searching…" : "Find Matches"}
            </button>
            {searched && (
              <button onClick={handleReset} className="btn-ghost flex items-center gap-2 text-slate-500 px-3">
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        {searched && !loading && (
          <div className="space-y-4">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1 shadow-sm w-fit">
              <button
                onClick={() => setActiveTab("properties")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === "properties" ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <Home className="w-3.5 h-3.5" />
                Properties
                <span className={`ml-1 rounded-full text-xs px-1.5 py-0.5 font-bold ${activeTab === "properties" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>{properties.length}</span>
              </button>
              <button
                onClick={() => setActiveTab("enquiries")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${activeTab === "enquiries" ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                <FileText className="w-3.5 h-3.5" />
                Enquiries
                <span className={`ml-1 rounded-full text-xs px-1.5 py-0.5 font-bold ${activeTab === "enquiries" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>{enquiries.length}</span>
              </button>
            </div>

            {/* Properties table */}
            {activeTab === "properties" && (
              <div className="card overflow-hidden">
                {properties.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      <Home className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-500">No matching properties</p>
                    <p className="text-xs text-slate-400 mt-1">Try broadening your criteria</p>
                  </div>
                ) : (
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
                          <th className="table-th">For</th>
                          <th className="table-th">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {properties.map((row) => (
                          <tr key={row.id} className="hover:bg-violet-50/30 transition-colors">
                            <td className="table-td text-slate-400 font-mono text-xs">{row.id}</td>
                            <td className="table-td">
                              <Link href={`/properties/${row.id}`} className="font-semibold text-slate-800 hover:text-violet-600 transition-colors">
                                {row.building?.name || "—"}{row.flatNumber ? ` - ${row.flatNumber}` : ""}
                              </Link>
                              <p className="text-xs text-slate-400 mt-0.5">{row.address || ""}</p>
                            </td>
                            <td className="table-td">
                              <p className="font-medium">{row.ownerName || "—"}</p>
                              <p className="text-xs text-slate-400">{row.ownerMobile || ""}</p>
                            </td>
                            <td className="table-td">
                              <span className="font-medium">{row.propertyType?.name || "—"}</span>
                              {row.bhkOffice && <span className="ml-2 badge badge-slate">{row.bhkOffice.name}</span>}
                            </td>
                            <td className="table-td font-semibold text-slate-800">{formatPrice(row.price)}</td>
                            <td className="table-td text-slate-500">{row.area?.name || "—"}</td>
                            <td className="table-td">
                              <span className={`badge ${row.forType === 1 ? "badge-blue" : "badge-orange"}`}>
                                {row.forType === 1 ? "Rent" : "Buy"}
                              </span>
                            </td>
                            <td className="table-td">
                              {row.status ? <span className="badge badge-green">{row.status.name}</span> : <span className="badge badge-slate">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Enquiries table */}
            {activeTab === "enquiries" && (
              <div className="card overflow-hidden">
                {enquiries.length === 0 ? (
                  <div className="py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                      <FileText className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="font-medium text-slate-500">No matching enquiries</p>
                    <p className="text-xs text-slate-400 mt-1">Try broadening your criteria</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="table-th">#</th>
                          <th className="table-th">Client</th>
                          <th className="table-th">Type / BHK</th>
                          <th className="table-th">Area</th>
                          <th className="table-th">Budget</th>
                          <th className="table-th">For</th>
                          <th className="table-th">Status</th>
                          <th className="table-th">Assigned To</th>
                          <th className="table-th">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {enquiries.map((row) => (
                          <tr key={row.id} className="hover:bg-violet-50/30 transition-colors">
                            <td className="table-td text-slate-400 font-mono text-xs">{row.id}</td>
                            <td className="table-td">
                              <Link href={`/enquiries/${row.id}`} className="font-semibold text-slate-800 hover:text-violet-600 transition-colors">
                                {row.name}
                              </Link>
                              <p className="text-xs text-slate-400 mt-0.5">{row.mobile}{row.email ? ` · ${row.email}` : ""}</p>
                            </td>
                            <td className="table-td">
                              <span className="font-medium">{row.propertyType?.name || "—"}</span>
                              {row.bhkOffice && <span className="ml-2 badge badge-slate">{row.bhkOffice.name}</span>}
                            </td>
                            <td className="table-td text-slate-500">{row.area?.name || "—"}</td>
                            <td className="table-td text-slate-500">{row.budget || "—"}</td>
                            <td className="table-td">
                              <span className={`badge ${row.forType === 1 ? "badge-blue" : "badge-orange"}`}>
                                {row.forType === 1 ? "Rent" : "Buy"}
                              </span>
                            </td>
                            <td className="table-td">
                              {row.status ? <span className="badge badge-green">{row.status.name}</span> : <span className="badge badge-slate">—</span>}
                            </td>
                            <td className="table-td text-slate-500">
                              {row.user ? `${row.user.firstName} ${row.user.lastName}` : "—"}
                            </td>
                            <td className="table-td text-slate-400 text-xs">{formatDate(row.createdAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!searched && (
          <div className="card py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-50 flex items-center justify-center mx-auto mb-4">
              <Crosshair className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-1">Find Matches</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">
              Select criteria above and click <strong>Find Matches</strong> to see matching properties and enquiries side by side.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense>
      <MatchPageInner />
    </Suspense>
  );
}
