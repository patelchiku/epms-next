import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const rows = await prisma.housingEnquiry.findMany({
      where: { isRemoved: false, createdAt: { gte: sevenDaysAgo } },
      orderBy: { id: "desc" },
    });

    const mobiles = rows.map((r) => r.leadPhone ?? "").filter(Boolean);
    const mobileExistsMap = await checkMobilesExist(mobiles);

    const leads = rows.map((r) => {
      const phone = r.leadPhone ?? "";
      const remark = `${r.leadName} is looking for ${r.apartmentNames ?? ""} on ${r.serviceType ?? ""} in ${r.localityName ?? ""}`;
      return {
        id:        r.id,
        name:      r.leadName ?? "",
        mobile:    phone,
        email:     r.leadEmail ?? "",
        remark,
        segment:   r.categoryType ?? "",
        apartment: r.apartmentNames ?? "",
        city:      r.cityName ?? "",
        date:      r.leadDate ?? "",
        exists:    mobileExistsMap[phone] ?? false,
      };
    });

    return NextResponse.json({ leads, count: leads.length });
  } catch (err) {
    console.error("Housing leads error:", err);
    return NextResponse.json({ error: "Failed to fetch Housing leads", leads: [], count: 0 }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await prisma.housingEnquiry.update({ where: { id: Number(id) }, data: { isRemoved: true } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Housing delete error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

async function checkMobilesExist(mobiles: string[]): Promise<Record<string, boolean>> {
  if (mobiles.length === 0) return {};
  const results = await prisma.enquiry.findMany({
    where: { OR: mobiles.map((m) => ({ mobileNos: { contains: m } })) },
    select: { mobileNos: true },
  });
  const existingRaw = results.map((r) => r.mobileNos);
  const map: Record<string, boolean> = {};
  for (const m of mobiles) {
    map[m] = existingRaw.some((raw) => raw.includes(m));
  }
  return map;
}
