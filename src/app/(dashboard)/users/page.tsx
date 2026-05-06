"use client";

import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import { Plus, User, Edit, UserCheck, UserX } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { formatDate, getInitials } from "@/lib/utils";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/users")
      .then((r) => setUsers(r.data))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Header
        title="Users"
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Users" }]}
        actions={<Link href="/users/add" className="btn-primary"><Plus className="w-4 h-4" />Add User</Link>}
      />

      <div className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card p-5 animate-pulse">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))
            : users.map((u) => (
                <div key={u.id} className="card p-5 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-violet-200">
                        {getInitials(`${u.firstName} ${u.lastName}`)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{u.firstName} {u.lastName}</p>
                        <span className="badge badge-violet text-[10px]">{u.role?.name}</span>
                      </div>
                    </div>
                    <Link href={`/users/${u.id}/edit`}
                      className="btn-ghost p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono">{u.mobile}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">{u.email}</div>
                    <div className="flex items-center gap-1.5">Joined {formatDate(u.dateOfJoin)}</div>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
