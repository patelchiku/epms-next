import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stringifyMobiles } from "@/lib/utils";
import { canDo } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

const createSchema = z.object({
  clientName: z.string().min(1),
  mobileNos: z.array(z.string()).min(1),
  email: z.string().email().optional().or(z.literal("")),
  forType: z.number().int().min(1).max(2).default(1),
  propertyTypeId: z.number().int().optional().nullable(),
  segmentId: z.number().int().optional().nullable(),
  bhkOfficeId: z.number().int().optional().nullable(),
  budget: z.string().optional(),
  sourceId: z.number().int().optional().nullable(),
  statusId: z.number().int().optional().nullable(),
  isNonUse: z.boolean().default(false),
  nonUseId: z.number().int().optional().nullable(),
  isDraft: z.boolean().default(false),
  draftReasonId: z.number().int().optional().nullable(),
  remark: z.string().optional(),
  nfd: z.string().optional(),
  areaId: z.number().int().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "enquiry.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const user = session.user as any;
    const { searchParams } = req.nextUrl;
    const page = Number(searchParams.get("page") || 1);
    const pageSize = Number(searchParams.get("pageSize") || 20);
    const filter = searchParams.get("filter");
    const search = searchParams.get("search") || "";

    // Advanced filter params
    const statusId = searchParams.get("statusId");
    const sourceId = searchParams.get("sourceId");
    const forType = searchParams.get("forType");
    const propertyTypeId = searchParams.get("propertyTypeId");
    const bhkOfficeId = searchParams.get("bhkOfficeId");
    const areaId = searchParams.get("areaId");
    const assignedUserId = searchParams.get("userId");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const showDraft = searchParams.get("showDraft") === "true";
    const showNonUse = searchParams.get("showNonUse") === "true";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);

    // Non-admin users see only their own enquiries (unless assignedUserId override by admin)
    const isAdmin = user.roleId === 1;
    let userFilter: any = isAdmin ? {} : { userId: Number(user.id) };
    if (isAdmin && assignedUserId) userFilter = { userId: Number(assignedUserId) };

    let dateFilter: any = {};
    if (filter === "today") dateFilter = { nfd: { gte: today, lt: tomorrow } };
    else if (filter === "tomorrow") dateFilter = { nfd: { gte: tomorrow, lt: dayAfter } };
    else if (filter === "pending") dateFilter = { nfd: { lt: today } };

    const where: any = {
      ...userFilter,
      ...dateFilter,
      ...(showDraft ? {} : { isDraft: false }),
      ...(showNonUse ? {} : { isNonUse: false }),
      ...(statusId && { statusId: Number(statusId) }),
      ...(sourceId && { sourceId: Number(sourceId) }),
      ...(forType && { forType: Number(forType) }),
      ...(propertyTypeId && { propertyTypeId: Number(propertyTypeId) }),
      ...(bhkOfficeId && { bhkOfficeId: Number(bhkOfficeId) }),
      ...(areaId && { areaId: Number(areaId) }),
      ...(dateFrom && { addedAt: { gte: new Date(dateFrom) } }),
      ...(dateTo && { addedAt: { ...(dateFrom ? { gte: new Date(dateFrom) } : {}), lte: new Date(dateTo + "T23:59:59") } }),
      ...(search && {
        OR: [
          { clientName: { contains: search } },
          { mobileNos: { contains: search } },
          { email: { contains: search } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      prisma.enquiry.findMany({
        where,
        orderBy: { addedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          source: { select: { name: true } },
          status: { select: { name: true } },
          propertyType: { select: { name: true } },
          segment: { select: { name: true } },
          bhkOffice: { select: { name: true } },
          area: { select: { name: true } },
          user: { select: { firstName: true, lastName: true } },
        },
      }),
      prisma.enquiry.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (err) {
    console.error("enquiries GET error:", err);
    return NextResponse.json({ data: [], total: 0, page: 1, pageSize: 20, totalPages: 0 }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "enquiry.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const user = session.user as any;
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const d = parsed.data;
    const enquiry = await prisma.enquiry.create({
      data: {
        clientName: d.clientName,
        mobileNos: stringifyMobiles(d.mobileNos),
        email: d.email || null,
        forType: d.forType,
        propertyTypeId: d.propertyTypeId || null,
        segmentId: d.segmentId || null,
        bhkOfficeId: d.bhkOfficeId || null,
        budget: d.budget || null,
        sourceId: d.sourceId || null,
        statusId: d.statusId || null,
        isNonUse: d.isNonUse,
        nonUseId: d.nonUseId || null,
        isDraft: d.isDraft,
        draftReasonId: d.draftReasonId || null,
        remark: d.remark || null,
        nfd: d.nfd ? new Date(d.nfd) : null,
        areaId: d.areaId || null,
        userId: Number(user.id),
      },
    });

    logActivity(Number(user.id), "created", "enquiry", enquiry.id, `Added enquiry: ${d.clientName}`);
    return NextResponse.json({ success: true, data: enquiry }, { status: 201 });
  } catch (err) {
    console.error("enquiries POST error:", err);
    return NextResponse.json({ error: "Failed to create enquiry" }, { status: 500 });
  }
}
