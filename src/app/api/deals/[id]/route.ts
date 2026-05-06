import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { payments, ...dealData } = await req.json();
  const updated = await prisma.propertyDeal.update({
    where: { id: Number(id) },
    data: dealData,
  });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.propertyDeal.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
