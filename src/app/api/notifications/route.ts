import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const userId = Number(user.id);
    const isAdmin = user.roleId === 1;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userFilter = isAdmin ? {} : { userId };

    // Compute alerts in parallel
    const [overdueCount, todayCount, pendingApprovals, activities] = await Promise.all([
      // NFDs overdue (past today, not null)
      prisma.enquiry.count({
        where: { ...userFilter, nfd: { lt: today }, isNonUse: false, isDraft: false },
      }),
      // NFDs due today
      prisma.enquiry.count({
        where: { ...userFilter, nfd: { gte: today, lt: tomorrow }, isNonUse: false, isDraft: false },
      }),
      // Pending approvals (admin only)
      isAdmin ? prisma.userApproval.count({ where: { approved: 0 } }) : Promise.resolve(0),
      // Activity log: last 50 entries (all for admin, own for staff)
      prisma.systemActivity.findMany({
        where: isAdmin ? undefined : { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    const alerts = [
      { type: "overdue_nfd", label: "Overdue follow-ups", count: overdueCount, href: "/enquiries?filter=pending", color: "red" },
      { type: "today_nfd", label: "Follow-ups due today", count: todayCount, href: "/enquiries?filter=today", color: "amber" },
      ...(isAdmin && pendingApprovals > 0
        ? [{ type: "pending_approvals", label: "Pending approvals", count: pendingApprovals, href: "/approvals", color: "blue" }]
        : []),
    ].filter((a) => a.count > 0);

    const totalAlerts = alerts.reduce((s, a) => s + a.count, 0);

    return NextResponse.json({ alerts, activities, totalAlerts });
  } catch (err) {
    console.error("notifications GET error:", err);
    return NextResponse.json({ alerts: [], activities: [], totalAlerts: 0 });
  }
}
