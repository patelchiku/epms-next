import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { canDo } from "@/lib/permissions";
import { logActivity } from "@/lib/activityLog";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // active=true requests are used for employee dropdowns across modules — allow any logged-in user
    const isDropdown = req.nextUrl.searchParams.get("active") === "true";
    if (!isDropdown && !canDo(session, "users.view"))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const users = await prisma.user.findMany({
      where: { isPresent: true },
      orderBy: { id: "asc" },
      include: { role: { select: { name: true } } },
    });

    return NextResponse.json(users.map(({ password: _pw, ...u }) => u));
  } catch (err) {
    console.error("users GET error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!canDo(session, "users.manage")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        mobile: body.mobile,
        password: hashedPassword,
        roleId: body.roleId,
      },
    });

    logActivity(Number((session.user as any).id), "created", "user", user.id, `Added new user: ${body.firstName} ${body.lastName}`);
    return NextResponse.json({ success: true, data: { id: user.id } }, { status: 201 });
  } catch (err) {
    console.error("users POST error:", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
