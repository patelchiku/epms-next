import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { canDo } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const forType = searchParams.get("forType") ? Number(searchParams.get("forType")) : undefined;
    const areaId = searchParams.get("areaId") ? Number(searchParams.get("areaId")) : undefined;
    const bhkOfficeId = searchParams.get("bhkOfficeId") ? Number(searchParams.get("bhkOfficeId")) : undefined;
    const propertyTypeId = searchParams.get("propertyTypeId") ? Number(searchParams.get("propertyTypeId")) : undefined;
    const budgetId = searchParams.get("budgetId") ? Number(searchParams.get("budgetId")) : undefined;

    // At least one criteria needed
    if (!forType && !areaId && !bhkOfficeId && !propertyTypeId && !budgetId) {
      return NextResponse.json({ properties: [], enquiries: [], total: { properties: 0, enquiries: 0 } });
    }

    const propertyWhere: any = {};
    const enquiryWhere: any = { isNonUse: false, isDraft: false };

    if (forType) { propertyWhere.forType = forType; enquiryWhere.forType = forType; }
    if (areaId) { propertyWhere.areaId = areaId; enquiryWhere.areaId = areaId; }
    if (bhkOfficeId) { propertyWhere.bhkOfficeId = bhkOfficeId; enquiryWhere.bhkOfficeId = bhkOfficeId; }
    if (propertyTypeId) { propertyWhere.propertyTypeId = propertyTypeId; enquiryWhere.propertyTypeId = propertyTypeId; }
    if (budgetId) { enquiryWhere.budgetId = budgetId; }

    const [properties, enquiries] = await Promise.all([
      canDo(session, "property.view")
        ? prisma.property.findMany({
            where: propertyWhere,
            take: 50,
            orderBy: { addedAt: "desc" },
            include: {
              area: { select: { name: true } },
              bhkOffice: { select: { name: true } },
              propertyType: { select: { name: true } },
              building: { select: { name: true } },
              status: { select: { name: true } },
            },
          })
        : [],
      canDo(session, "enquiry.view")
        ? prisma.enquiry.findMany({
            where: enquiryWhere,
            take: 50,
            orderBy: { addedAt: "desc" },
            include: {
              area: { select: { name: true } },
              bhkOffice: { select: { name: true } },
              propertyType: { select: { name: true } },
              status: { select: { name: true } },
              user: { select: { firstName: true, lastName: true } },
            },
          })
        : [],
    ]);

    return NextResponse.json({
      properties,
      enquiries,
      total: { properties: properties.length, enquiries: enquiries.length },
    });
  } catch (err) {
    console.error("match GET error:", err);
    return NextResponse.json({ properties: [], enquiries: [], total: { properties: 0, enquiries: 0 } });
  }
}
