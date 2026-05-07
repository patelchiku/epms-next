"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, FileText, Home, Settings, ChevronDown,
  LogOut, Menu, X, MapPin, Building2, Layers, Tag, Briefcase,
  DollarSign, Target, AlertCircle, Activity, UserCog, Users,
  Handshake, CheckCircle2, Ruler, Sofa, Hash, List, SlidersHorizontal, Crosshair
} from "lucide-react";
import { useState } from "react";

type NavChild = { name: string; href: string; icon: any };
type NavItem = {
  name: string;
  href?: string;
  icon: any;
  perm?: string;
  children?: NavChild[];
};

const navigation: NavItem[] = [
  { name: "Dashboard",    href: "/dashboard",  icon: LayoutDashboard },
  { name: "Enquiry",      href: "/enquiries",  icon: FileText,       perm: "enquiry.view" },
  { name: "Property",     href: "/properties", icon: Home,           perm: "property.view" },
  { name: "Property Deal",href: "/deals",      icon: Handshake,      perm: "deals.view" },
  { name: "Match Search", href: "/match",      icon: Crosshair },
  {
    name: "Master",
    icon: Settings,
    perm: "master.view",
    children: [
      { name: "Areas",          href: "/master/areas",          icon: MapPin },
      { name: "Buildings",      href: "/master/buildings",      icon: Building2 },
      { name: "Property Types", href: "/master/property-types", icon: Layers },
      { name: "Segments",       href: "/master/segments",       icon: Tag },
      { name: "BHK / Office",   href: "/master/bhk-office",     icon: Briefcase },
      { name: "Budget",         href: "/master/budget",         icon: DollarSign },
      { name: "Sources",        href: "/master/sources",        icon: Target },
      { name: "Statuses",       href: "/master/statuses",       icon: AlertCircle },
      { name: "Activities",     href: "/master/activities",     icon: Activity },
      { name: "Furniture",      href: "/master/furniture",      icon: Sofa },
      { name: "Measurements",   href: "/master/measurements",   icon: Ruler },
      { name: "Non-Use",        href: "/master/non-use",        icon: Hash },
      { name: "Draft Reasons",  href: "/master/draft-reasons",  icon: List },
      { name: "Roles",          href: "/master/roles",          icon: UserCog },
    ],
  },
  { name: "Users",     href: "/users",     icon: Users,          perm: "users.view" },
  { name: "Approvals", href: "/approvals", icon: CheckCircle2,   perm: "approvals.view" },
  { name: "Settings",  href: "/settings",  icon: SlidersHorizontal, perm: "settings.view" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openGroup, setOpenGroup] = useState<string | null>(
    pathname.startsWith("/master") ? "Master" : null
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleId: number = (session?.user as any)?.roleId ?? 0;
  const userPerms: string[] = (session?.user as any)?.permissions ?? [];
  const isAdmin = roleId === 1;

  function canSee(perm?: string): boolean {
    if (!perm) return true;
    if (isAdmin) return true;
    return userPerms.includes(perm);
  }

  const visibleNav = navigation.filter((item) => canSee(item.perm));

  return (
    <>
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white shadow-lg text-slate-700 rounded-xl border border-slate-200"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full bg-slate-900 text-white flex flex-col z-40 transition-transform duration-300",
        "w-[260px]",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
          <div className="w-8 h-8 rounded-lg bg-violet-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-violet-500/30">
            <Home className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Top Space</p>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Property CRM</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {visibleNav.map((item) => {
            if (item.children) {
              const isOpen = openGroup === item.name;
              const isActive = item.children.some((c) => pathname.startsWith(c.href));
              return (
                <div key={item.name}>
                  <button
                    onClick={() => setOpenGroup(isOpen ? null : item.name)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-slate-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.name}</span>
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200 text-slate-500", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="mt-0.5 ml-4 pl-4 border-l border-white/10 space-y-0.5 py-1">
                      {item.children.map((child) => (
                        <Link key={child.href} href={child.href}
                          className={cn(
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all",
                            pathname === child.href
                              ? "bg-violet-500/20 text-violet-300 font-semibold"
                              : "text-slate-400 hover:bg-white/5 hover:text-white"
                          )}
                          onClick={() => setMobileOpen(false)}
                        >
                          <child.icon className="w-3.5 h-3.5 flex-shrink-0" />
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            const isActive = pathname.startsWith(item.href!);
            return (
              <Link key={item.href} href={item.href!}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-600/25"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
