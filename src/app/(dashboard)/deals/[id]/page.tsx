"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import { formatDate } from "@/lib/utils";
import { Handshake, User, Home, IndianRupee, Calendar, Trash2, Phone } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function DealDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/deals/${id}`)
      .then((r) => setDeal(r.data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    if (!confirm("Delete this deal?")) return;
    await axios.delete(`/api/deals/${id}`);
    toast.success("Deal deleted");
    router.push("/deals");
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;
  if (!deal) return <div className="p-10 text-center text-slate-400">Deal not found</div>;

  const totalPaid = deal.payments?.reduce((sum: number, p: any) => sum + (Number(p.amount) || 0), 0) || 0;
  const dealAmount = Number(deal.dealAmount) || 0;
  const balancePct = dealAmount > 0 ? Math.min((totalPaid / dealAmount) * 100, 100) : 0;

  return (
    <div>
      <Header
        title={deal.propertyName || `Deal #${deal.id}`}
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Deals", href: "/deals" }, { label: `#${deal.id}` }]}
        actions={
          <button onClick={handleDelete} className="btn-danger"><Trash2 className="w-4 h-4" />Delete</button>
        }
      />

      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Hero card */}
          <div className="card p-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-200 flex-shrink-0">
                <Handshake className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-900">{deal.propertyName || "—"}</h2>
                {deal.flatOffice && <p className="text-slate-500 text-sm">Unit: {deal.flatOffice}</p>}
                <p className="text-slate-400 text-xs mt-1">Deal Date: {deal.dealDate ? formatDate(deal.dealDate) : "—"}</p>
              </div>
              {deal.dealAmount && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-emerald-600">₹{Number(deal.dealAmount).toLocaleString("en-IN")}</p>
                  <p className="text-xs text-slate-400">Deal Amount</p>
                </div>
              )}
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="card p-5">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-orange-500" /> Owner
              </h3>
              <p className="font-semibold text-slate-900">{deal.ownerName || "—"}</p>
              {deal.ownerNumber && (
                <a href={`tel:${deal.ownerNumber}`} className="text-sm text-violet-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5" />{deal.ownerNumber}
                </a>
              )}
            </div>
            <div className="card p-5">
              <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-blue-500" /> Buyer
              </h3>
              <p className="font-semibold text-slate-900">{deal.buyerName || "—"}</p>
              {deal.buyerNumber && (
                <a href={`tel:${deal.buyerNumber}`} className="text-sm text-violet-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5" />{deal.buyerNumber}
                </a>
              )}
            </div>
          </div>

          {/* Payment progress */}
          {deal.payments?.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <IndianRupee className="w-4 h-4 text-violet-500" /> Payment Schedule
                </h3>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">₹{totalPaid.toLocaleString("en-IN")} paid</p>
                  {dealAmount > 0 && <p className="text-xs text-slate-400">of ₹{dealAmount.toLocaleString("en-IN")}</p>}
                </div>
              </div>
              {dealAmount > 0 && (
                <div className="mb-5">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                      style={{ width: `${balancePct}%` }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 text-right">{balancePct.toFixed(0)}% paid</p>
                </div>
              )}
              <div className="space-y-3">
                {deal.payments.map((p: any, i: number) => (
                  <div key={p.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">₹{Number(p.amount).toLocaleString("en-IN")}</p>
                      {p.remark && <p className="text-xs text-slate-500">{p.remark}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {p.date ? formatDate(p.date) : "—"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {deal.remark && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-800 mb-2 text-sm">Remarks</h3>
              <p className="text-sm text-slate-600">{deal.remark}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-5">
            <h3 className="font-bold text-slate-800 mb-3 text-sm">Deal Summary</h3>
            <div className="space-y-2.5 text-sm">
              <InfoRow label="Deal ID" value={`#${deal.id}`} />
              <InfoRow label="Deal Date" value={deal.dealDate ? formatDate(deal.dealDate) : "—"} />
              <InfoRow label="Deal Amount" value={deal.dealAmount ? `₹${Number(deal.dealAmount).toLocaleString("en-IN")}` : "—"} highlight />
              <InfoRow label="Commission" value={deal.commission || "—"} />
              <InfoRow label="Employee" value={deal.employee ? `${deal.employee.firstName} ${deal.employee.lastName}` : "—"} />
              <InfoRow label="Total Paid" value={`₹${totalPaid.toLocaleString("en-IN")}`} />
              {dealAmount > 0 && (
                <InfoRow label="Balance" value={`₹${(dealAmount - totalPaid).toLocaleString("en-IN")}`} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500 text-xs">{label}</span>
      <span className={`font-semibold ${highlight ? "text-emerald-600" : "text-slate-800"}`}>{value}</span>
    </div>
  );
}
