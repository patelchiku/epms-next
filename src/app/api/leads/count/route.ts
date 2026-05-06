import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [housingCount, acresCount, mbApiKey] = await Promise.all([
      prisma.housingEnquiry.count({ where: { isRemoved: false, createdAt: { gte: sevenDaysAgo } } }),
      prisma.acresEnquiry.count({ where: { isRemoved: false, addedAt: { gte: sevenDaysAgo } } }),
      prisma.appSetting.findUnique({ where: { key: "mb_api_key" } }),
    ]);

    let mbCount = 0;
    const apiKey = mbApiKey?.value?.trim();
    if (apiKey) {
      try {
        const endDate = fmtDate(new Date());
        const startDate = fmtDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000));
        const url = `http://rating.magicbricks.com/mbRating/download.xml?key=${encodeURIComponent(apiKey)}&startDate=${startDate}&endDate=${endDate}`;
        const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
        const xml = await res.text();
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
        const parsed = parser.parse(xml);
        mbCount = Number(parsed?.leads?.["@_count"] ?? parsed?.leads?.count ?? 0);
      } catch {
        mbCount = 0;
      }
    }

    return NextResponse.json({ mbCount, housingCount, acresCount });
  } catch (err) {
    console.error("leads count error:", err);
    return NextResponse.json({ mbCount: 0, housingCount: 0, acresCount: 0 }, { status: 500 });
  }
}

function fmtDate(d: Date) {
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}
