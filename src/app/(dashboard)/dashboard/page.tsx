import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import { formatDate } from "@/lib/utils";
import { FileText, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import PortalLeadsSection from "./PortalLeadsSection";

async function getDashboardStats(userId: number, roleId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const userFilter = roleId === 1 ? {} : { userId };

  const [todayCount, tomorrowCount, pendingCount, recentEnquiries] = await Promise.all([
    prisma.enquiry.count({ where: { ...userFilter, nfd: { gte: today, lt: tomorrow }, isNonUse: false, isDraft: false } }),
    prisma.enquiry.count({ where: { ...userFilter, nfd: { gte: tomorrow, lt: dayAfter }, isNonUse: false, isDraft: false } }),
    prisma.enquiry.count({ where: { ...userFilter, nfd: { lt: today }, isNonUse: false, isDraft: false } }),
    prisma.enquiry.findMany({
      where: userFilter,
      orderBy: { addedAt: "desc" },
      take: 8,
      include: { source: true, status: true, propertyType: true },
    }),
  ]);

  return { todayCount, tomorrowCount, pendingCount, recentEnquiries };
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;
  const stats = await getDashboardStats(Number(user.id), user.roleId);
  const isAdmin = user.roleId === 1;

  const cards = [
    { label: "Today",    value: stats.todayCount,    href: "/enquiries?filter=today",    icon: Clock,        color: "bg-blue-500" },
    { label: "Tomorrow", value: stats.tomorrowCount, href: "/enquiries?filter=tomorrow", icon: FileText,     color: "bg-green-500" },
    { label: "Pending",  value: stats.pendingCount,  href: "/enquiries?filter=pending",  icon: AlertCircle,  color: "bg-orange-500" },
  ];

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Enquiry stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cards.map((card) => (
            <Link key={card.label} href={card.href} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-slate-800">{card.value}</p>
              <p className="text-sm text-slate-500 mt-1">{card.label}</p>
            </Link>
          ))}
        </div>

        {/* Portal leads section — client component */}
        {isAdmin && <PortalLeadsSection />}

        {/* Recent Enquiries */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Enquiries</h2>
            <Link href="/enquiries" className="text-sm text-violet-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="table-th">#</th>
                  <th className="table-th">Client</th>
                  <th className="table-th">Type</th>
                  <th className="table-th">Source</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">NFD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentEnquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="table-td text-slate-400 font-mono text-xs">{e.id}</td>
                    <td className="table-td">
                      <Link href={`/enquiries/${e.id}`} className="font-medium text-slate-800 hover:text-violet-600">{e.clientName}</Link>
                    </td>
                    <td className="table-td text-slate-600">{e.propertyType?.name || "—"}</td>
                    <td className="table-td text-slate-600">{e.source?.name || "—"}</td>
                    <td className="table-td">
                      {e.status ? (
                        <span className="badge badge-green">{e.status.name}</span>
                      ) : "—"}
                    </td>
                    <td className="table-td text-slate-500">{formatDate(e.nfd)}</td>
                  </tr>
                ))}
                {stats.recentEnquiries.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No enquiries yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
