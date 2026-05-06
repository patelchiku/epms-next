"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import Header from "@/components/layout/Header";
import axios from "axios";
import { toast } from "sonner";
import { Plus, Trash2, Loader2 } from "lucide-react";

export default function AddPropertyPage() {
  const router = useRouter();
  const [masters, setMasters] = useState<Record<string, any[]>>({});
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, control } = useForm<any>({
    defaultValues: { forType: 1, otherMobiles: [{ value: "" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "otherMobiles" });

  useEffect(() => {
    const keys = "property-types,segments,bhk-office,buildings,areas,sources,property-statuses,furniture,measurements";
    const load = (attempt: number) =>
      fetch(`/api/master/batch?keys=${keys}`)
        .then((r) => r.json())
        .then((data) => { if (Object.keys(data).length > 0) setMasters(data); else throw new Error("empty"); })
        .catch(() => { if (attempt < 2) setTimeout(() => load(attempt + 1), 1500); });
    load(0);
  }, []);

  async function onSubmit(data: any) {
    setSaving(true);
    try {
      const payload = {
        ...data,
        otherMobiles: JSON.stringify(data.otherMobiles.map((m: any) => m.value).filter(Boolean)),
      };
      await axios.post("/api/properties", payload);
      toast.success("Property added");
      router.push("/properties");
    } catch {
      toast.error("Failed to add property");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Header
        title="Add Property"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Properties", href: "/properties" }, { label: "Add" }]}
      />
      <div className="p-6 max-w-5xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Basic Info */}
          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Property Details</h2>
            <div className="form-grid">
              <div>
                <label className="label">For</label>
                <select {...register("forType", { valueAsNumber: true })} className="select">
                  <option value={1}>Rent</option>
                  <option value={2}>Buy</option>
                </select>
              </div>
              <div>
                <label className="label">Available From</label>
                <input {...register("availableFrom")} type="date" className="input" />
              </div>
              <div>
                <label className="label">Property Type</label>
                <select {...register("propertyTypeId", { valueAsNumber: true })} className="select">
                  <option value="">-- Select --</option>
                  {masters["property-types"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Segment</label>
                <select {...register("segmentId", { valueAsNumber: true })} className="select">
                  <option value="">-- Select --</option>
                  {masters["segments"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">BHK / Office</label>
                <select {...register("bhkOfficeId", { valueAsNumber: true })} className="select">
                  <option value="">-- Select --</option>
                  {masters["bhk-office"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select {...register("statusId", { valueAsNumber: true })} className="select">
                  <option value="">-- Select --</option>
                  {masters["property-statuses"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Location</h2>
            <div className="form-grid">
              <div>
                <label className="label">Building</label>
                <select {...register("buildingId", { valueAsNumber: true })} className="select">
                  <option value="">-- Select --</option>
                  {masters["buildings"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Area</label>
                <select {...register("areaId", { valueAsNumber: true })} className="select">
                  <option value="">-- Select --</option>
                  {masters["areas"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Block</label>
                <input {...register("block")} className="input" placeholder="Block / Tower" />
              </div>
              <div>
                <label className="label">Flat / Unit No.</label>
                <input {...register("flatNumber")} className="input" placeholder="e.g. A-402" />
              </div>
            </div>
            <div>
              <label className="label">Full Address</label>
              <textarea {...register("address")} rows={2} className="textarea" placeholder="Street address..." />
            </div>
          </div>

          {/* Specifications */}
          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Specifications</h2>
            <div className="form-grid-3">
              <div>
                <label className="label">Super Built-up</label>
                <input {...register("superBuiltUp")} className="input" placeholder="sq.ft" />
              </div>
              <div>
                <label className="label">Carpet Area</label>
                <input {...register("carpet")} className="input" placeholder="sq.ft" />
              </div>
              <div>
                <label className="label">Construction / Terrace</label>
                <input {...register("constructionArea")} className="input" placeholder="sq.ft" />
              </div>
              <div>
                <label className="label">Measurement</label>
                <select {...register("measurementId", { valueAsNumber: true })} className="select">
                  <option value="">-- Select --</option>
                  {masters["measurements"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Furniture</label>
                <select {...register("furnitureId", { valueAsNumber: true })} className="select">
                  <option value="">-- Select --</option>
                  {masters["furniture"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Parking</label>
                <input {...register("parking")} className="input" placeholder="e.g. 1 Covered" />
              </div>
              <div>
                <label className="label">Key Status</label>
                <input {...register("keyStatus")} className="input" placeholder="With owner / broker..." />
              </div>
            </div>
          </div>

          {/* Owner & Price */}
          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Owner & Pricing</h2>
            <div className="form-grid">
              <div>
                <label className="label">Owner Name</label>
                <input {...register("ownerName")} className="input" placeholder="Full name" />
              </div>
              <div>
                <label className="label">Owner Mobile</label>
                <input {...register("ownerMobile")} className="input" placeholder="Primary mobile" />
              </div>
              <div>
                <label className="label">Price (cr-lakh-000-00)</label>
                <input {...register("price")} className="input" placeholder="e.g. 0-50-0-0-00" />
              </div>
              <div>
                <label className="label">Commission</label>
                <input {...register("commission")} className="input" placeholder="e.g. 1%" />
              </div>
              <div>
                <label className="label">Source</label>
                <select {...register("sourceId", { valueAsNumber: true })} className="select">
                  <option value="">-- Select --</option>
                  {masters["sources"]?.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Other Mobile Numbers</label>
              <div className="space-y-2">
                {fields.map((field, i) => (
                  <div key={field.id} className="flex gap-2">
                    <input {...register(`otherMobiles.${i}.value`)} className="input flex-1" placeholder="Mobile number" />
                    {fields.length > 1 && (
                      <button type="button" onClick={() => remove(i)} className="btn-ghost p-2.5 text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => append({ value: "" })} className="btn-secondary text-xs py-1.5">
                  <Plus className="w-3.5 h-3.5" /> Add Number
                </button>
              </div>
            </div>
            <div>
              <label className="label">Remark</label>
              <textarea {...register("remark")} rows={3} className="textarea" placeholder="Additional notes..." />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-8">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Save Property"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
