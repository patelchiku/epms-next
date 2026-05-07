"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Phone, Lock, Clock, X } from "lucide-react";

const schema = z.object({
  mobile: z.string().min(10, "Enter valid mobile number"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApprovalPopup, setShowApprovalPopup] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError("");

    // Get client IP via public API
    let ipAddress = "";
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const json = await res.json();
      ipAddress = json.ip;
    } catch {}

    const result = await signIn("credentials", {
      mobile: data.mobile,
      password: data.password,
      ipAddress,
      redirect: false,
    });

    setLoading(false);

    if (result?.error === "PENDING_APPROVAL") {
      setShowApprovalPopup(true);
    } else if (result?.error === "REJECTED") {
      setError("Your access has been rejected. Contact admin.");
    } else if (result?.error) {
      setError("Invalid mobile number or password.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-xl mb-4">
            <img src="/images/logo.jpg" alt="Logo" className="w-14 h-14 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
          </div>
          <h1 className="text-2xl font-bold text-white">Top Space Management</h1>
          <p className="text-slate-400 text-sm mt-1">Real Estate CRM</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("mobile")}
                  type="tel"
                  placeholder="Enter mobile number"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Enter password"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : "Sign In"}
            </button>
          </form>
        </div>
      </div>

      {/* Pending Approval Popup */}
      {showApprovalPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
            <button
              onClick={() => setShowApprovalPopup(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Animated clock icon */}
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-5">
              <div className="absolute inset-0 rounded-full bg-amber-100 animate-ping opacity-40" />
              <div className="absolute inset-2 rounded-full bg-amber-50 animate-pulse" />
              <div className="relative w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-8 h-8 text-amber-500 animate-spin" style={{ animationDuration: "3s" }} />
              </div>
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">Waiting for Approval</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-1">
              Your login request has been sent to the admin.
            </p>
            <p className="text-slate-500 text-sm leading-relaxed mb-6">
              You will be able to sign in once the admin approves your access.
            </p>

            {/* Animated dots */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>

            <button
              onClick={() => setShowApprovalPopup(false)}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
