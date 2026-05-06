import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const setting = await prisma.appSetting.findUnique({ where: { key: "mb_api_key" } });
    const apiKey = setting?.value?.trim();

    if (!apiKey) {
      return NextResponse.json({ error: "MagicBricks API key not configured. Go to Settings to add it.", leads: [], count: 0 });
    }

    const endDate = fmtDate(new Date());
    const startDate = fmtDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));
    const url = `http://rating.magicbricks.com/mbRating/download.xml?key=${encodeURIComponent(apiKey)}&startDate=${startDate}&endDate=${endDate}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const xml = await res.text();

    if (xml.includes("Access Denied") || xml.includes("access denied")) {
      return NextResponse.json({ error: "MagicBricks API access denied. Your server IP may not be whitelisted. Contact MagicBricks support.", leads: [], count: 0 });
    }

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
    const parsed = parser.parse(xml);
    const root = parsed?.leads;
    const rawLeads: any[] = root?.lead ? (Array.isArray(root.lead) ? root.lead : [root.lead]) : [];

    // Check which mobiles already exist in enquiries
    const mobileExistsMap = await checkMobilesExist(rawLeads.map((l) => String(l.mobile ?? "").trim()));

    const leads = rawLeads.map((l: any) => ({
      name:    String(l.name    ?? ""),
      mobile:  String(l.mobile  ?? "").trim(),
      email:   String(l.email   ?? ""),
      remark:  String(l.msg     ?? ""),
      address: String(l.address ?? ""),
      city:    String(l.city    ?? ""),
      date:    String(l.vdate   ?? ""),
      exists:  mobileExistsMap[String(l.mobile ?? "").trim()] ?? false,
    }));

    return NextResponse.json({ leads, count: leads.length });
  } catch (err) {
    console.error("MB leads error:", err);
    return NextResponse.json({ error: "Failed to fetch MagicBricks leads", leads: [], count: 0 }, { status: 500 });
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

function fmtDate(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
