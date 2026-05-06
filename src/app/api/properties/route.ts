import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
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
  } catch (err) {
    console.error("properties GET error:", err);
    return NextResponse.json({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = session.user as any;
    const body = await req.json();
    const toIntOrNull = (v: any) => (v === "" || v == null || isNaN(Number(v))) ? null : Number(v);

    const property = await prisma.property.create({
      data: {
        ...body,
        forType: Number(body.forType) || 1,
        propertyTypeId: toIntOrNull(body.propertyTypeId),
        segmentId: toIntOrNull(body.segmentId),
        bhkOfficeId: toIntOrNull(body.bhkOfficeId),
        buildingId: toIntOrNull(body.buildingId),
        areaId: toIntOrNull(body.areaId),
        measurementId: toIntOrNull(body.measurementId),
        furnitureId: toIntOrNull(body.furnitureId),
        statusId: toIntOrNull(body.statusId),
        sourceId: toIntOrNull(body.sourceId),
        availableFrom: body.availableFrom ? new Date(body.availableFrom) : null,
        userId: Number(user.id),
        addedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: property }, { status: 201 });
  } catch (err) {
    console.error("properties POST error:", err);
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 });
  }
}
