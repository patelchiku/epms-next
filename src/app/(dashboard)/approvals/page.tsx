"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { CheckCircle2, XCircle, Clock, MapPin } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils";

const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Pending",  className: "badge-orange" },
  1: { label: "Approved", className: "badge-green" },
  2: { label: "Rejected", className: "badge-red" },
};

export default function ApprovalsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(0); }, []);

  async function fetchData(attempt: number = 0) {
    try {
      const res = await axios.get("/api/approvals");
      setItems(res.data);
      setLoading(false);
    } catch {
      if (attempt < 2) {
        setTimeout(() => fetchData(attempt + 1), 1500);
      } else {
        toast.error("Failed to load");
        setLoading(false);
      }
    }
  }

  async function handleAction(id: number, approved: number) {
    try {
      await axios.put("/api/approvals", { id, approved });
      toast.success(approved === 1 ? "Approved!" : "Rejected");
      fetchData();
    } catch { toast.error("Action failed"); }
  }

  const pending  = items.filter((i) => i.approved === 0);
  const resolved = items.filter((i) => i.approved !== 0);

  return (
    <div>
      <Header
        title="IP Approvals"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Approvals" }]}
      />

      <div className="p-6 max-w-4xl space-y-6">
        {/* Pending */}
        {pending.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-orange-100 bg-orange-50 flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              <h2 className="font-bold text-orange-800">Pending Approvals</h2>
              <span className="ml-auto badge badge-orange">{pending.length}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {pending.map((item) => (
                <ApprovalRow key={item.id} item={item} onAction={handleAction} />
              ))}
            </div>
          </div>
        )}

        {/* Resolved */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="font-bold text-slate-800">All Approvals</h2>
          </div>
          {loading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No approval requests yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {items.map((item) => (
                <ApprovalRow key={item.id} item={item} onAction={handleAction} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ApprovalRow({ item, onAction }: { item: any; onAction: (id: number, status: number) => void }) {
  const status = STATUS_MAP[item.approved] || STATUS_MAP[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-bold text-slate-900 text-sm">
            {item.user?.firstName} {item.user?.lastName}
          </p>
          <span className={`badge ${status.className}`}>{status.label}</span>
          <span className="badge badge-slate text-[10px]">{item.user?.role?.name}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
          <span className="font-mono">{item.ipAddress}</span>
          {item.address && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />{item.address}
            </span>
          )}
          <span>{item.date} {item.time}</span>
        </div>
      </div>

      {item.approved === 0 && (
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onAction(item.id, 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
          </button>
          <button
            onClick={() => onAction(item.id, 2)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-all"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      )}
    </div>
  );
}
