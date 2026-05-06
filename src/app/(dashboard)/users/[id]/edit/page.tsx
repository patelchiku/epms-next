"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Header from "@/components/layout/Header";
import axios from "axios";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    Promise.all([
      axios.get(`/api/users/${id}`),
      axios.get("/api/master/roles"),
    ]).then(([userRes, rolesRes]) => {
      setRoles(rolesRes.data);
      const u = userRes.data;
      reset({
        firstName: u.firstName,
        lastName: u.lastName ?? "",
        mobile: u.mobile,
        email: u.email ?? "",
        roleId: u.roleId ?? "",
        designation: u.designation ?? "",
        dateOfJoin: u.dateOfJoin ? new Date(u.dateOfJoin).toISOString().split("T")[0] : "",
        dateOfBirth: u.dateOfBirth ? new Date(u.dateOfBirth).toISOString().split("T")[0] : "",
        isPresent: u.isPresent ?? true,
        password: "",
      });
    }).catch(() => toast.error("Failed to load user"))
      .finally(() => setLoading(false));
  }, [id, reset]);

  async function onSubmit(data: any) {
    setSaving(true);
    try {
      const payload = { ...data };
      if (!payload.password) delete payload.password;
      await axios.put(`/api/users/${id}`, payload);
      toast.success("User updated");
      router.push("/users");
    } catch {
      toast.error("Failed to update user");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-10 text-center text-slate-400">Loading...</div>;

  return (
    <div>
      <Header
        title="Edit User"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users", href: "/users" }, { label: "Edit" }]}
      />
      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Personal Information</h2>
            <div className="form-grid">
              <div>
                <label className="label">First Name *</label>
                <input {...register("firstName", { required: true })} className="input" />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input {...register("lastName")} className="input" />
              </div>
              <div>
                <label className="label">Mobile (Login ID)</label>
                <input {...register("mobile")} className="input" />
              </div>
              <div>
                <label className="label">Email</label>
                <input {...register("email")} type="email" className="input" />
              </div>
            </div>
          </div>

          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Work Details</h2>
            <div className="form-grid">
              <div>
                <label className="label">Role</label>
                <select {...register("roleId", { valueAsNumber: true })} className="select">
                  <option value="">-- Select role --</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Designation</label>
                <input {...register("designation")} className="input" placeholder="e.g. Sales Executive" />
              </div>
              <div>
                <label className="label">Date of Joining</label>
                <input {...register("dateOfJoin")} type="date" className="input" />
              </div>
              <div>
                <label className="label">Date of Birth</label>
                <input {...register("dateOfBirth")} type="date" className="input" />
              </div>
            </div>
            <div>
              <label className="flex items-center gap-2.5 cursor-pointer w-fit">
                <input type="checkbox" {...register("isPresent")} className="w-4 h-4 rounded accent-violet-600" />
                <span className="text-sm font-medium text-slate-700">Currently Employed</span>
              </label>
            </div>
          </div>

          <div className="form-section space-y-5">
            <h2 className="text-base font-bold text-slate-800 pb-3 border-b border-slate-100">Change Password</h2>
            <p className="text-xs text-slate-400">Leave blank to keep the current password.</p>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  className="input pr-10"
                  placeholder="Leave blank to keep current"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-8">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : "Update User"}
            </button>
            <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
