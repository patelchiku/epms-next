import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const property = await prisma.property.findUnique({
    where: { id: Number(id) },
    include: {
      building: { select: { id: true, name: true } },
      area: { select: { id: true, name: true } },
      propertyType: { select: { id: true, name: true } },
      segment: { select: { id: true, name: true } },
      bhkOffice: { select: { id: true, name: true } },
      status: { select: { id: true, name: true } },
      measurement: { select: { id: true, name: true } },
      furniture: { select: { id: true, name: true } },
      source: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!property) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(property);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.property.update({ where: { id: Number(id) }, data: body });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.property.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
