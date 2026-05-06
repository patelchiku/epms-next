import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const rows = await prisma.acresEnquiry.findMany({
      where: { isRemoved: false, addedAt: { gte: sevenDaysAgo } },
      orderBy: { id: "desc" },
    });

    const mobiles = rows.map((r) => normalizePhone(r.phone ?? "")).filter(Boolean);
    const mobileExistsMap = await checkMobilesExist(mobiles);

    const leads = rows.map((r) => {
      const phone = normalizePhone(r.phone ?? "");
      return {
        id:      r.id,
        name:    r.name ?? "",
        mobile:  phone,
        email:   r.email ?? "",
        remark:  r.description ?? "",
        user:    r.user ?? "",
        date:    r.addedAt.toISOString(),
        exists:  mobileExistsMap[phone] ?? false,
      };
    });

    return NextResponse.json({ leads, count: leads.length });
  } catch (err) {
    console.error("99acres leads error:", err);
    return NextResponse.json({ error: "Failed to fetch 99acres leads", leads: [], count: 0 }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    await prisma.acresEnquiry.update({ where: { id: Number(id) }, data: { isRemoved: true } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("99acres delete error:", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function normalizePhone(phone: string) {
  return phone.replace(/^\+91-?/, "").replace(/^\+/, "").trim();
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
