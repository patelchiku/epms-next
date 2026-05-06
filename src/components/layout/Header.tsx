"use client";

import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Breadcrumb = { label: string; href?: string };

type Props = {
  title: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
};

export default function Header({ title, breadcrumbs, actions }: Props) {
  const { data: session } = useSession();
  const user = session?.user as any;

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-0.5">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {i > 0 && <ChevronRight className="w-3 h-3" />}
                  {b.href ? (
                    <Link href={b.href} className="hover:text-violet-600 transition-colors">{b.label}</Link>
                  ) : (
                    <span className="text-slate-500 font-medium">{b.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
        </div>

        <div className="flex items-center gap-3">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          <div className="flex items-center gap-2.5 pl-3 border-l border-slate-100">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {getInitials(user?.name || "U")}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-tight">{user?.name}</p>
              <p className="text-[11px] text-slate-400 font-medium">{user?.roleName}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
