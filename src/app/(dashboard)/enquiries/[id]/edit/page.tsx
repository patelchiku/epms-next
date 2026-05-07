"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import Header from "@/components/layout/Header";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Phone } from "lucide-react";
import { useSession } from "next-auth/react";

export default function EditEnquiryPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.roleId === 1;
  const [masters, setMasters] = useState<Record<string, any[]>>({});
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, watch, reset } = useForm<any>({
    defaultValues: { mobileNos: [{ value: "" }], forType: 1 },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "mobileNos" });
  const isDraft = watch("isDraft");
  const isNonUse = watch("isNonUse");

  useEffect(() => {
    const keys = "property-types,segments,bhk-office,sources,statuses,areas,budget,non-use,draft-reasons";
    const loadMasters = (attempt: number): Promise<Record<string, any[]>> =>
      fetch(`/api/master/batch?keys=${keys}`).then((r) => r.json())
        .then((d) => Object.keys(d).length > 0 ? d : (attempt < 2 ? new Promise(res => setTimeout(() => loadMasters(attempt + 1).then(res), 1500)) : {}));
    Promise.all([
      fetch(`/api/enquiries/${id}`).then((r) => r.json()),
      loadMasters(0),
    ]).then(([enqData, masterData]) => {
      setMasters(masterData);

      const e = enqData;
      let mobiles: string[] = [];
      try { mobiles = typeof e.mobileNos === "string" ? JSON.parse(e.mobileNos) : e.mobileNos ?? []; }
      catch { mobiles = []; }

      reset({
        clientName: e.clientName,
        email: e.email ?? "",
        forType: e.forType,
        mobileNos: mobiles.length ? mobiles.map((v: string) => ({ value: v })) : [{ value: "" }],
        propertyTypeId: e.propertyTypeId ?? "",
        segmentId: e.segmentId ?? "",
        bhkOfficeId: e.bhkOfficeId ?? "",
        budget: e.budget ?? "",
        sourceId: e.sourceId ?? "",
        statusId: e.statusId ?? "",
        areaId: e.areaId ?? "",
        nfd: e.nfd ? new Date(e.nfd).toISOString().split("T")[0] : "",
        remark: e.remark ?? "",
        isDraft: e.isDraft ?? false,
        draftReasonId: e.draftReasonId ?? "",
        isNonUse: e.isNonUse ?? false,
        nonUseId: e.nonUseId ?? "",
        assignedUserId: e.userId ?? "",
      });
    }).catch(() => toast.error("Failed to load enquiry"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/users?active=true").then((r) => r.json()).then(setEmployees).catch(() => {});
    }
  }, [isAdmin]);

  async function onSubmit(data: any) {
    setSaving(true);
    try {
      await axios.put(`/api/enquiries/${id}`, {
        ...data,
        mobileNos: data.mobileNos.map((m: any) => m.value).filter(Boolean),
      });
      toast.success("Enquiry updated");
      router.push(`/enquiries/${id}`);
    } catch {
      toast.error("Failed to update enquiry");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;

  return (
    <div>
      <Header
        title="Edit Enquiry"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Enquiries", href: "/enquiries" }, { label: "Edit" }]}
      />
      <div className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Client Information</h2>
            <div className="form-grid">
              <div>
                <label className="label">Client Name *</label>
                <input {...register("clientName")} className="input" placeholder="Full name" />
              </div>
              <div>
                <label className="label">Email</label>
                <input {...register("email")} type="email" className="input" placeholder="email@example.com" />
              </div>
            </div>
            <div>
              <label className="label">Mobile Numbers *</label>
              <div className="space-y-2">
                {fields.map((field, i) => (
                  <div key={field.id} className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input {...register(`mobileNos.${i}.value`)} className="input pl-9" placeholder="10-digit mobile" />
                    </div>
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(i)} className="btn-ghost p-2.5 text-red-400 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => append({ value: "" })} className="btn-secondary text-xs gap-1.5 py-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Mobile
                </button>
              </div>
            </div>
          </div>

          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Property Requirements</h2>
            <div className="form-grid">
              <div>
                <label className="label">Looking For</label>
                <select {...register("forType")} className="select">
                  <option value={1}>Rent</option>
                  <option value={2}>Buy</option>
                </select>
              </div>
              <div>
                <label className="label">Property Type</label>
                <select {...register("propertyTypeId")} className="select">
                  <option value="">-- Select --</option>
                  {masters["property-types"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Segment</label>
                <select {...register("segmentId")} className="select">
                  <option value="">-- Select --</option>
                  {masters["segments"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">BHK / Office</label>
                <select {...register("bhkOfficeId")} className="select">
                  <option value="">-- Select --</option>
                  {masters["bhk-office"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Budget</label>
                <select {...register("budget")} className="select">
                  <option value="">-- Select --</option>
                  {masters["budget"]?.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Preferred Area</label>
                <select {...register("areaId")} className="select">
                  <option value="">-- Select --</option>
                  {masters["areas"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Follow-up & Tracking</h2>
            <div className="form-grid">
              <div>
                <label className="label">Source</label>
                <select {...register("sourceId")} className="select">
                  <option value="">-- Select --</option>
                  {masters["sources"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select {...register("statusId")} className="select">
                  <option value="">-- Select --</option>
                  {masters["statuses"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Next Follow-up Date</label>
                <input {...register("nfd")} type="date" className="input" />
              </div>
              {isAdmin && (
                <div>
                  <label className="label">Assign To</label>
                  <select {...register("assignedUserId")} className="select">
                    <option value="">-- Assign to employee --</option>
                    {employees.map((e: any) => (
                      <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="label">Remark</label>
              <textarea {...register("remark")} rows={3} className="textarea" placeholder="Additional notes..." />
            </div>
          </div>

          <div className="form-section space-y-4">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Enquiry Flags</h2>
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register("isDraft")} className="w-4 h-4 rounded accent-violet-600" />
                <span className="text-sm font-medium text-slate-700">Mark as Draft</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" {...register("isNonUse")} className="w-4 h-4 rounded accent-violet-600" />
                <span className="text-sm font-medium text-slate-700">Mark as Non-Use</span>
              </label>
            </div>
            {isDraft && (
              <div>
                <label className="label">Draft Reason</label>
                <select {...register("draftReasonId")} className="select">
                  <option value="">-- Select reason --</option>
                  {masters["draft-reasons"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}
            {isNonUse && (
              <div>
                <label className="label">Non-Use Reason</label>
                <select {...register("nonUseId")} className="select">
                  <option value="">-- Select reason --</option>
                  {masters["non-use"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-8">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Update Enquiry"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
