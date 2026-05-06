import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { stringifyMobiles } from "@/lib/utils";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: Number(id) },
    include: {
      source: { select: { id: true, name: true } },
      status: { select: { id: true, name: true } },
      propertyType: { select: { id: true, name: true } },
      segment: { select: { id: true, name: true } },
      bhkOffice: { select: { id: true, name: true } },
      area: { select: { id: true, name: true } },
      nonUse: { select: { id: true, name: true } },
      draftReason: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
      comments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { firstName: true, lastName: true } },
          activity: { select: { name: true } },
        },
      },
    },
  });

  if (!enquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(enquiry);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const updated = await prisma.enquiry.update({
    where: { id: Number(id) },
    data: {
      ...body,
      mobileNos: body.mobileNos ? stringifyMobiles(body.mobileNos) : undefined,
      nfd: body.nfd ? new Date(body.nfd) : null,
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.enquiry.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
