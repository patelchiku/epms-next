import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { canDo } from "@/lib/permissions";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "users.view")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { role: { select: { id: true, name: true } } },
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const { password: _pw, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (err) {
    console.error("user GET error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "users.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await req.json();
    const { password, ...rest } = body;

    const data: any = { ...rest };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data,
    });

    return NextResponse.json({ success: true, data: { id: updated.id } });
  } catch (err) {
    console.error("user PUT error:", err);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
