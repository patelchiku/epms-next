import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Header from "@/components/layout/Header";
import { formatDate } from "@/lib/utils";
import { FileText, Clock, AlertCircle, Building2, Home } from "lucide-react";
import Link from "next/link";

async function getDashboardStats(userId: number, roleId: number) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const userFilter = roleId === 1 ? {} : { userId };

  const [todayCount, tomorrowCount, pendingCount, mbCount, housingCount, acresCount, recentEnquiries] =
    await Promise.all([
      prisma.enquiry.count({ where: { ...userFilter, nfd: { gte: today, lt: tomorrow }, isNonUse: false, isDraft: false } }),
      prisma.enquiry.count({ where: { ...userFilter, nfd: { gte: tomorrow, lt: dayAfter }, isNonUse: false, isDraft: false } }),
      prisma.enquiry.count({ where: { ...userFilter, nfd: { lt: today }, isNonUse: false, isDraft: false } }),
      roleId === 1 ? prisma.acresEnquiry.count({ where: { isRemoved: false } }) : Promise.resolve(0),
      roleId === 1 ? prisma.housingEnquiry.count({ where: { isRemoved: false } }) : Promise.resolve(0),
      roleId === 1 ? prisma.acresEnquiry.count({ where: { isRemoved: false } }) : Promise.resolve(0),
      prisma.enquiry.findMany({
        where: userFilter,
        orderBy: { addedAt: "desc" },
        take: 8,
        include: { source: true, status: true, propertyType: true },
      }),
    ]);

  return { todayCount, tomorrowCount, pendingCount, mbCount, housingCount, acresCount, recentEnquiries };
}

export default async function DashboardPage() {
  const session = await auth();
  const user = session?.user as any;
  const stats = await getDashboardStats(Number(user.id), user.roleId);

  const cards = [
    { label: "Today", value: stats.todayCount, href: "/enquiries?filter=today", icon: Clock, color: "bg-blue-500" },
    { label: "Tomorrow", value: stats.tomorrowCount, href: "/enquiries?filter=tomorrow", icon: FileText, color: "bg-green-500" },
    { label: "Pending", value: stats.pendingCount, href: "/enquiries?filter=pending", icon: AlertCircle, color: "bg-orange-500" },
  ];

  const portalCards = user.roleId === 1 ? [
    { label: "MagicBricks", value: stats.mbCount, color: "text-red-500" },
    { label: "Housing.com", value: stats.housingCount, color: "text-red-500" },
    { label: "99 Acres", value: stats.acresCount, color: "text-red-500" },
  ] : [];

  return (
    <div>
      <Header title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
          {portalCards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-slate-200 p-5">
              <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
              <p className="text-sm text-slate-500 mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-800">Recent Enquiries</h2>
            <Link href="/enquiries" className="text-sm text-blue-600 hover:underline">View all</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">#</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Client</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Type</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Source</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">NFD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.recentEnquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 text-slate-400">{e.id}</td>
                    <td className="px-6 py-3">
                      <Link href={`/enquiries/${e.id}`} className="font-medium text-slate-800 hover:text-blue-600">{e.clientName}</Link>
                    </td>
                    <td className="px-6 py-3 text-slate-600">{e.propertyType?.name || "—"}</td>
                    <td className="px-6 py-3 text-slate-600">{e.source?.name || "—"}</td>
                    <td className="px-6 py-3">
                      {e.status ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">{e.status.name}</span>
                      ) : "—"}
                    </td>
                    <td className="px-6 py-3 text-slate-500">{formatDate(e.nfd)}</td>
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
