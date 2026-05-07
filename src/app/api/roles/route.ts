import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function isAdmin(session: any): boolean {
  return (session?.user as any)?.roleId === 1;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !isAdmin(session))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const roles = await prisma.role.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(roles);
  } catch (err) {
    console.error("roles GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, permissions } = await req.json();
    if (!name?.trim())
      return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const role = await prisma.role.create({
      data: {
        name: name.trim(),
        permissions: permissions ? JSON.stringify(permissions) : null,
      },
    });
    return NextResponse.json({ success: true, data: role }, { status: 201 });
  } catch (err) {
    console.error("roles POST error:", err);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
