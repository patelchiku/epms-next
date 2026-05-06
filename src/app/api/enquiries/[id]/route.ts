import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stringifyMobiles } from "@/lib/utils";

const toIntOrNull = z.union([z.number().int(), z.string().transform(v => v === "" ? null : parseInt(v, 10))]).nullable().optional();
const toBool = z.union([z.boolean(), z.string().transform(v => v === "true")]).optional();

const updateSchema = z.object({
  clientName: z.string().min(1),
  mobileNos: z.array(z.string()).min(1),
  email: z.string().optional(),
  forType: z.union([z.number().int(), z.string().transform(v => parseInt(v, 10))]).default(1),
  propertyTypeId: toIntOrNull,
  segmentId: toIntOrNull,
  bhkOfficeId: toIntOrNull,
  budget: z.string().optional(),
  sourceId: toIntOrNull,
  statusId: toIntOrNull,
  areaId: toIntOrNull,
  isNonUse: toBool,
  nonUseId: toIntOrNull,
  isDraft: toBool,
  draftReasonId: toIntOrNull,
  remark: z.string().optional(),
  nfd: z.string().optional(),
});

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

  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const d = parsed.data;
    const updated = await prisma.enquiry.update({
      where: { id: Number(id) },
      data: {
        clientName: d.clientName,
        mobileNos: stringifyMobiles(d.mobileNos),
        email: d.email || null,
        forType: d.forType,
        propertyTypeId: d.propertyTypeId ?? null,
        segmentId: d.segmentId ?? null,
        bhkOfficeId: d.bhkOfficeId ?? null,
        budget: d.budget || null,
        sourceId: d.sourceId ?? null,
        statusId: d.statusId ?? null,
        areaId: d.areaId ?? null,
        isNonUse: d.isNonUse ?? false,
        nonUseId: d.nonUseId ?? null,
        isDraft: d.isDraft ?? false,
        draftReasonId: d.draftReasonId ?? null,
        remark: d.remark || null,
        nfd: d.nfd ? new Date(d.nfd) : null,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("enquiry PUT error:", err);
    return NextResponse.json({ error: "Failed to update enquiry" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.enquiry.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
