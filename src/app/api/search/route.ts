import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { canDo } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
    if (q.length < 2) return NextResponse.json({ enquiries: [], properties: [] });

    const userId: number = (session.user as any).id;
    const isAdmin: boolean = (session.user as any).roleId === 1;

    const results: { enquiries: any[]; properties: any[] } = {
      enquiries: [],
      properties: [],
    };

    if (canDo(session, "enquiry.view") || !isAdmin) {
      const where: any = {
        OR: [
          { clientName: { contains: q } },
          { mobileNos: { contains: q } },
          { email: { contains: q } },
        ],
      };
      if (!isAdmin) where.userId = userId;

      results.enquiries = await prisma.enquiry.findMany({
        where,
        take: 6,
        orderBy: { addedAt: "desc" },
        select: {
          id: true,
          clientName: true,
          mobileNos: true,
          email: true,
          forType: true,
        },
      });
    }

    if (canDo(session, "property.view") || !isAdmin) {
      const where: any = {
        OR: [
          { ownerName: { contains: q } },
          { ownerMobile: { contains: q } },
          { otherMobiles: { contains: q } },
          { address: { contains: q } },
          { flatNumber: { contains: q } },
        ],
      };
      if (!isAdmin) where.userId = userId;

      results.properties = await prisma.property.findMany({
        where,
        take: 6,
        orderBy: { addedAt: "desc" },
        select: {
          id: true,
          ownerName: true,
          ownerMobile: true,
          address: true,
          flatNumber: true,
          forType: true,
        },
      });
    }

    return NextResponse.json(results);
  } catch (err) {
    console.error("search GET error:", err);
    return NextResponse.json({ enquiries: [], properties: [] }, { status: 500 });
  }
}
