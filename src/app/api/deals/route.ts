import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  return NextResponse.json({ success: true, data: deal }, { status: 201 });
}
