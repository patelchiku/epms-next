import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await prisma.user.findMany({
    where: { isPresent: true },
    orderBy: { id: "asc" },
    include: { role: { select: { name: true } } },
  });

  return NextResponse.json(users.map(({ password: _pw, ...u }) => u));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  return NextResponse.json({ success: true, data: { id: user.id } }, { status: 201 });
}
