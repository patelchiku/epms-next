"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/layout/Header";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Phone } from "lucide-react";

const schema = z.object({
  clientName: z.string().min(1, "Client name is required"),
  mobileNos: z.array(z.object({ value: z.string().min(10, "Enter valid mobile") })).min(1),
  email: z.string().email().optional().or(z.literal("")),
  forType: z.coerce.number().default(1),
  propertyTypeId: z.coerce.number().optional().nullable(),
  segmentId: z.coerce.number().optional().nullable(),
  bhkOfficeId: z.coerce.number().optional().nullable(),
  budget: z.string().optional(),
  sourceId: z.coerce.number().optional().nullable(),
  statusId: z.coerce.number().optional().nullable(),
  areaId: z.coerce.number().optional().nullable(),
  nfd: z.string().optional(),
  remark: z.string().optional(),
  isDraft: z.boolean().default(false),
  draftReasonId: z.coerce.number().optional().nullable(),
  isNonUse: z.boolean().default(false),
  nonUseId: z.coerce.number().optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export default function AddEnquiryPage() {
  const router = useRouter();
  const [masters, setMasters] = useState<Record<string, any[]>>({});
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { mobileNos: [{ value: "" }], forType: 1 },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "mobileNos" });

  useEffect(() => {
    const keys = "property-types,segments,bhk-office,sources,statuses,areas,budget,non-use,draft-reasons";
    const load = (attempt: number) =>
      fetch(`/api/master/batch?keys=${keys}`)
        .then((r) => r.json())
        .then((data) => { if (Object.keys(data).length > 0) setMasters(data); else throw new Error("empty"); })
        .catch(() => { if (attempt < 2) setTimeout(() => load(attempt + 1), 1500); });
    load(0);
  }, []);

  const isDraft = watch("isDraft");
  const isNonUse = watch("isNonUse");

  async function onSubmit(data: FormData) {
    setSaving(true);
    try {
      await axios.post("/api/enquiries", {
        ...data,
        mobileNos: data.mobileNos.map((m) => m.value),
      });
      toast.success("Enquiry added successfully");
      router.push("/enquiries");
    } catch {
      toast.error("Failed to add enquiry");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Header
        title="Add Enquiry"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Enquiries", href: "/enquiries" }, { label: "Add" }]}
      />
      <div className="p-6 max-w-4xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Client Info */}
          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Client Information</h2>
            <div className="form-grid">
              <div>
                <label className="label">Client Name *</label>
                <input {...register("clientName")} className="input" placeholder="Full name" />
                {errors.clientName && <p className="error-msg">{errors.clientName.message}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input {...register("email")} type="email" className="input" placeholder="email@example.com" />
              </div>
            </div>

            {/* Mobile numbers */}
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
                      <button type="button" onClick={() => remove(i)} className="btn-ghost p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {errors.mobileNos?.[0]?.value && <p className="error-msg">{errors.mobileNos[0].value?.message}</p>}
                <button type="button" onClick={() => append({ value: "" })} className="btn-secondary text-xs gap-1.5 py-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Mobile
                </button>
              </div>
            </div>
          </div>

          {/* Property Requirements */}
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

          {/* Follow-up & Source */}
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
            </div>
            <div>
              <label className="label">Remark</label>
              <textarea {...register("remark")} rows={3} className="textarea" placeholder="Additional notes..." />
            </div>
          </div>

          {/* Draft / Non-use */}
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

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-8">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Enquiry"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
