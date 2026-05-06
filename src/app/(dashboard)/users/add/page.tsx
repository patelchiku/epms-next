"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Header from "@/components/layout/Header";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function AddUserPage() {
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    fetch("/api/master/roles").then((r) => r.json()).then((d) => setRoles(Array.isArray(d) ? d : [])).catch(console.error);
  }, []);

  async function onSubmit(data: any) {
    setSaving(true);
    try {
      await axios.post("/api/users", data);
      toast.success("User created successfully");
      router.push("/users");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create user");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <Header
        title="Add User"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users", href: "/users" }, { label: "Add" }]}
      />
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Personal Information</h2>
            <div className="form-grid">
              <div>
                <label className="label">First Name *</label>
                <input {...register("firstName", { required: "Required" })} className="input" placeholder="First name" />
                {errors.firstName && <p className="error-msg">{String(errors.firstName.message)}</p>}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...register("lastName")} className="input" placeholder="Last name" />
              </div>
              <div>
                <label className="label">Mobile (Login ID) *</label>
                <input {...register("mobile", { required: "Required" })} className="input" placeholder="10-digit mobile" />
                {errors.mobile && <p className="error-msg">{String(errors.mobile.message)}</p>}
              </div>
              <div>
                <label className="label">Email</label>
                <input {...register("email")} type="email" className="input" placeholder="email@example.com" />
              </div>
            </div>
          </div>

          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Work Details</h2>
            <div className="form-grid">
              <div>
                <label className="label">Role *</label>
                <select {...register("roleId", { required: "Required", valueAsNumber: true })} className="select">
                  <option value="">-- Select role --</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
                {errors.roleId && <p className="error-msg">{String(errors.roleId.message)}</p>}
              </div>
              <div>
                <label className="label">Date of Joining</label>
                <input {...register("dateOfJoin")} type="date" className="input" />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input {...register("dateOfBirth")} type="date" className="input" />
              </div>
              <div>
                <label className="label">Designation</label>
                <input {...register("designation")} className="input" placeholder="e.g. Sales Executive" />
              </div>
            </div>
          </div>

          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Login Credentials</h2>
            <div>
              <label className="label">Password *</label>
              <div className="relative">
                <input
                  {...register("password", { required: "Password required", minLength: { value: 4, message: "Min 4 characters" } })}
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Set a strong password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="error-msg">{String(errors.password.message)}</p>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-8">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Creating...</> : "Create User"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
