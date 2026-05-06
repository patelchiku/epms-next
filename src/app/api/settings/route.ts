import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const DEFAULTS: { key: string; label: string; value: string }[] = [
  { key: "mb_api_key",         label: "MagicBricks API Key",      value: "" },
  { key: "acres_api_url",      label: "99acres API URL",          value: "https://www.99acres.com/99api/v1/getmy99Response/" },
  { key: "acres_username",     label: "99acres Username",         value: "" },
  { key: "acres_password",     label: "99acres Password",         value: "" },
  { key: "housing_api_key",    label: "Housing.com API Key",      value: "" },
  { key: "housing_project_id", label: "Housing.com Project ID",   value: "" },
];

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const rows = await prisma.appSetting.findMany();
    const map: Record<string, string> = {};
    rows.forEach((r) => { map[r.key] = r.value; });

    // Fill in defaults for any keys not yet in DB
    DEFAULTS.forEach((d) => {
      if (!(d.key in map)) map[d.key] = d.value;
    });

    return NextResponse.json(map);
  } catch (err) {
    console.error("settings GET error:", err);
    return NextResponse.json({}, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body: Record<string, string> = await req.json();

    await Promise.all(
      Object.entries(body).map(([key, value]) => {
        const def = DEFAULTS.find((d) => d.key === key);
        return prisma.appSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value, label: def?.label ?? key },
        });
      })
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("settings PUT error:", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
