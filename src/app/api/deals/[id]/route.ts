import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { canDo } from "@/lib/permissions";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "deals.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const deal = await prisma.propertyDeal.findUnique({
      where: { id: Number(id) },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true } },
        payments: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(deal);
  } catch (err) {
    console.error("deal GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "deals.edit")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const user = session.user as any;
    const { payments, ...dealData } = await req.json();
    const dealId = Number(id);

    await prisma.$transaction(async (tx) => {
      await tx.propertyDeal.update({ where: { id: dealId }, data: dealData });
      if (Array.isArray(payments)) {
        await tx.propertyDealPayment.deleteMany({ where: { dealId } });
        const validPayments = payments.filter((p: any) => p.amount);
        if (validPayments.length > 0) {
          await tx.propertyDealPayment.createMany({
            data: validPayments.map((p: any) => ({
              dealId,
              amount: p.amount,
              date: p.date || null,
              remark: p.remark || null,
              userId: Number(user.id),
            })),
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("deal PUT error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "deals.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    await prisma.propertyDeal.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("deal DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
