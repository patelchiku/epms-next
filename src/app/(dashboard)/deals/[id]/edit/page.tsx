"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import Header from "@/components/layout/Header";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, IndianRupee } from "lucide-react";

export default function EditDealPage() {
  const { id } = useParams();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingDeal, setLoadingDeal] = useState(true);

  const { register, handleSubmit, control, reset } = useForm<any>({
    defaultValues: { payments: [{ amount: "", date: "", remark: "" }] },
  });
  const { fields, append, remove, replace } = useFieldArray({ control, name: "payments" });

  useEffect(() => {
    Promise.all([
      axios.get(`/api/deals/${id}`),
      axios.get("/api/users?active=true"),
    ]).then(([dealRes, usersRes]) => {
      const deal = dealRes.data;
      setUsers(usersRes.data.data || usersRes.data);
      reset({
        propertyName: deal.propertyName || "",
        flatOffice: deal.flatOffice || "",
        ownerName: deal.ownerName || "",
        ownerNumber: deal.ownerNumber || "",
        buyerName: deal.buyerName || "",
        buyerNumber: deal.buyerNumber || "",
        dealAmount: deal.dealAmount || "",
        dealDate: deal.dealDate ? deal.dealDate.slice(0, 10) : "",
        brokerageOwner: deal.brokerageOwner || "",
        employeeId: deal.employee?.id ?? "",
        remark: deal.remark || "",
        payments: deal.payments?.length
          ? deal.payments.map((p: any) => ({
              amount: p.amount || "",
              date: p.date ? p.date.slice(0, 10) : "",
              remark: p.remark || "",
            }))
          : [{ amount: "", date: "", remark: "" }],
      });
    }).catch(() => {
      toast.error("Failed to load deal");
    }).finally(() => setLoadingDeal(false));
  }, [id, reset]);

  async function onSubmit(data: any) {
    setSaving(true);
    try {
      const payments = data.payments?.filter((p: any) => p.amount);
      await axios.put(`/api/deals/${id}`, {
        ...data,
        employeeId: data.employeeId ? Number(data.employeeId) : null,
        payments,
      });
      toast.success("Deal updated successfully");
      router.push(`/deals/${id}`);
    } catch {
      toast.error("Failed to update deal");
    } finally {
      setSaving(false);
    }
  }

  if (loadingDeal) return <div className="p-10 text-center text-slate-400">Loading...</div>;

  return (
    <div>
      <Header
        title="Edit Deal"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Deals", href: "/deals" },
          { label: `#${id}`, href: `/deals/${id}` },
          { label: "Edit" },
        ]}
      />
      <div className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Property Info */}
          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Property Details</h2>
            <div className="form-grid">
              <div>
                <label className="label">Property Name / Address</label>
                <input {...register("propertyName")} className="input" placeholder="Property name or address" />
              </div>
              <div>
                <label className="label">Flat / Office No.</label>
                <input {...register("flatOffice")} className="input" placeholder="e.g. A-402" />
              </div>
            </div>
          </div>

          {/* Owner */}
          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Owner Details</h2>
            <div className="form-grid">
              <div>
                <label className="label">Owner Name</label>
                <input {...register("ownerName")} className="input" placeholder="Full name" />
              </div>
              <div>
                <label className="label">Owner Mobile</label>
                <input {...register("ownerNumber")} className="input" placeholder="Mobile number" />
              </div>
            </div>
          </div>

          {/* Buyer */}
          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Buyer Details</h2>
            <div className="form-grid">
              <div>
                <label className="label">Buyer Name</label>
                <input {...register("buyerName")} className="input" placeholder="Full name" />
              </div>
              <div>
                <label className="label">Buyer Mobile</label>
                <input {...register("buyerNumber")} className="input" placeholder="Mobile number" />
              </div>
            </div>
          </div>

          {/* Deal Info */}
          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Deal Information</h2>
            <div className="form-grid">
              <div>
                <label className="label">Deal Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input {...register("dealAmount")} className="input pl-9" placeholder="e.g. 4500000" />
                </div>
              </div>
              <div>
                <label className="label">Deal Date</label>
                <input {...register("dealDate")} type="date" className="input" />
              </div>
              <div>
                <label className="label">Brokerage (Owner/Builder)</label>
                <input {...register("brokerageOwner")} className="input" placeholder="e.g. 1% or ₹50,000" />
              </div>
              <div>
                <label className="label">Assigned Employee</label>
                <select {...register("employeeId")} className="select">
                  <option value="">-- Select employee --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Remarks</label>
              <textarea {...register("remark")} rows={3} className="textarea" placeholder="Additional deal notes..." />
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Payment Schedule</h2>
            <div className="space-y-3">
              {fields.map((field, i) => (
                <div key={field.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Installment {i + 1}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="label">Amount (₹)</label>
                      <input {...register(`payments.${i}.amount`)} className="input" placeholder="Payment amount" />
                    </div>
                    <div>
                      <label className="label">Payment Date</label>
                      <input {...register(`payments.${i}.date`)} type="date" className="input" />
                    </div>
                    <div>
                      <label className="label">Remarks</label>
                      <input {...register(`payments.${i}.remark`)} className="input" placeholder="e.g. Token, Advance..." />
                    </div>
                  </div>
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)}
                      className="absolute top-3 right-3 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button"
                onClick={() => append({ amount: "", date: "", remark: "" })}
                className="btn-secondary text-xs gap-1.5 py-2">
                <Plus className="w-3.5 h-3.5" /> Add Installment
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-8">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Update Deal"}
            </button>
            <button type="button" onClick={() => router.push(`/deals/${id}`)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
