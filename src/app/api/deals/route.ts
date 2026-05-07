import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { canDo } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "deals.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = req.nextUrl;
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 20);

    const [data, total] = await Promise.all([
      prisma.propertyDeal.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          employee: { select: { firstName: true, lastName: true } },
          payments: true,
        },
      }),
      prisma.propertyDeal.count(),
    ]);

    return NextResponse.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    console.error("deals GET error:", err);
    return NextResponse.json({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "deals.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const user = session.user as any;
    const { payments, ...dealData } = await req.json();

    const deal = await prisma.propertyDeal.create({
      data: {
        ...dealData,
        addedBy: Number(user.id),
        payments: payments?.length
          ? { create: payments.map((p: any) => ({ ...p, userId: Number(user.id) })) }
          : undefined,
      },
      include: { payments: true },
    });

    logActivity(Number(user.id), "created", "deal", deal.id, `Created deal #${deal.id}: ${dealData.clientName || ""}`);
    return NextResponse.json({ success: true, data: deal }, { status: 201 });
  } catch (err) {
    console.error("deals POST error:", err);
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
