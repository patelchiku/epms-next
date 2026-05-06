import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const page = Number(searchParams.get("page") || 1);
  const pageSize = Number(searchParams.get("pageSize") || 20);
  const search = searchParams.get("search") || "";
  const forType = searchParams.get("forType");

  const where: any = {
    ...(forType && { forType: Number(forType) }),
    ...(search && {
      OR: [
        { ownerName: { contains: search } },
        { ownerMobile: { contains: search } },
        { address: { contains: search } },
        { flatNumber: { contains: search } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { addedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        building: { select: { name: true } },
        area: { select: { name: true } },
        propertyType: { select: { name: true } },
        segment: { select: { name: true } },
        bhkOffice: { select: { name: true } },
        status: { select: { name: true } },
        user: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.property.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const body = await req.json();

  const property = await prisma.property.create({
    data: { ...body, userId: Number(user.id), addedAt: new Date() },
  });

  return NextResponse.json({ success: true, data: property }, { status: 201 });
}
