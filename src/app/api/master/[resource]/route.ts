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

export async function GET(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // master data reads are used for dropdowns across all modules — allow any logged-in user

    const { resource } = await params;
    const getModel = RESOURCE_MAP[resource];
    if (!getModel) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

    const model = getModel();
    const activeOnly = req.nextUrl.searchParams.get("active") !== "false";
    const data = await model.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { id: "asc" },
    });

    return NextResponse.json(data);
  } catch (err) {
    console.error("master GET error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "master.edit")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { resource } = await params;
    const getModel = RESOURCE_MAP[resource];
    if (!getModel) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

    const model = getModel();
    const body = await req.json();
    const record = await model.create({ data: body });
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (err) {
    console.error("master POST error:", err);
    return NextResponse.json({ error: "Failed to create" }, { status: 500 });
  }
}
