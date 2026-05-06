import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const RESOURCE_MAP: Record<string, any> = {
  areas: prisma.area,
  buildings: prisma.building,
  "property-types": prisma.propertyType,
  segments: prisma.segment,
  "bhk-office": prisma.bhkOffice,
  budget: prisma.budget,
  sources: prisma.source,
  statuses: prisma.enquiryStatus,
  "property-statuses": prisma.propertyStatus,
  activities: prisma.activity,
  furniture: prisma.furniture,
  measurements: prisma.measurement,
  "non-use": prisma.nonUse,
  "draft-reasons": prisma.draftReason,
  purposes: prisma.purpose,
  roles: prisma.role,
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resource } = await params;
  const model = RESOURCE_MAP[resource];
  if (!model) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

  const activeOnly = req.nextUrl.searchParams.get("active") !== "false";
  const data = await model.findMany({
    where: activeOnly ? { active: true } : undefined,
    orderBy: { id: "asc" },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { resource } = await params;
  const model = RESOURCE_MAP[resource];
  if (!model) return NextResponse.json({ error: "Unknown resource" }, { status: 404 });

  const body = await req.json();
  const record = await model.create({ data: body });
  return NextResponse.json({ success: true, data: record }, { status: 201 });
}
