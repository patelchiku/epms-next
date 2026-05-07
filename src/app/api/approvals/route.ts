import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { canDo } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "approvals.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const approvals = await prisma.userApproval.findMany({
      orderBy: { id: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true, mobile: true, role: { select: { name: true } } } },
      },
    });

    return NextResponse.json(approvals);
  } catch (err) {
    console.error("approvals GET error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "approvals.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id, approved } = await req.json();
    const record = await prisma.userApproval.update({
      where: { id: Number(id) },
      data: { approved: Number(approved) },
    });

    const action = Number(approved) === 1 ? "approved" : "rejected";
    logActivity(Number((session.user as any).id), action, "approval", record.userId, `${action === "approved" ? "Approved" : "Rejected"} user access for user #${record.userId}`);
    return NextResponse.json({ success: true, data: record });
  } catch (err) {
    console.error("approvals PUT error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
