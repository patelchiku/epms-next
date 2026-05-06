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
  roles: prisma.role,
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const keys = req.nextUrl.searchParams.get("keys")?.split(",") ?? [];
  if (!keys.length) return NextResponse.json({});

  const entries = await Promise.all(
    keys.map(async (key) => {
      const model = RESOURCE_MAP[key];
      if (!model) return [key, []];
      const data = await model.findMany({ where: { active: true }, orderBy: { id: "asc" } });
      return [key, data];
    })
  );

  return NextResponse.json(Object.fromEntries(entries));
}
