import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { canDo } from "@/lib/permissions";

const RESOURCE_MAP: Record<string, () => any> = {
  areas: () => prisma.area,
  buildings: () => prisma.building,
  "property-types": () => prisma.propertyType,
  segments: () => prisma.segment,
  "bhk-office": () => prisma.bhkOffice,
  budget: () => prisma.budget,
  sources: () => prisma.source,
  statuses: () => prisma.enquiryStatus,
  "property-statuses": () => prisma.propertyStatus,
  activities: () => prisma.activity,
  furniture: () => prisma.furniture,
  measurements: () => prisma.measurement,
  "non-use": () => prisma.nonUse,
  "draft-reasons": () => prisma.draftReason,
  purposes: () => prisma.purpose,
  roles: () => prisma.role,
};

export async function PUT(req: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "master.edit")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { resource, id } = await params;
    const getModel = RESOURCE_MAP[resource];
    if (!getModel) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

    const model = getModel();
    const body = await req.json();
    const record = await model.update({ where: { id: Number(id) }, data: body });
    return NextResponse.json({ success: true, data: record });
  } catch (err) {
    console.error("master PUT error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ resource: string; id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "master.edit")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { resource, id } = await params;
    const getModel = RESOURCE_MAP[resource];
    if (!getModel) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

    const model = getModel();
    await model.update({ where: { id: Number(id) }, data: { active: false } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("master DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
