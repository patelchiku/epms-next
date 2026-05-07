import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function isAdmin(session: any): boolean {
  return (session?.user as any)?.roleId === 1;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const { name, permissions, active } = await req.json();

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (permissions !== undefined) data.permissions = JSON.stringify(permissions);
    if (active !== undefined) data.active = active;

    const role = await prisma.role.update({ where: { id: Number(id) }, data });
    return NextResponse.json({ success: true, data: role });
  } catch (err) {
    console.error("role PUT error:", err);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || !isAdmin(session))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    if (Number(id) === 1)
      return NextResponse.json({ error: "Cannot delete the Admin role" }, { status: 400 });

    await prisma.role.update({ where: { id: Number(id) }, data: { active: false } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("role DELETE error:", err);
    return NextResponse.json({ error: "Failed to delete role" }, { status: 500 });
  }
}
