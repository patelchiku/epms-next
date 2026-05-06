import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const approvals = await prisma.userApproval.findMany({
    orderBy: { id: "desc" },
    include: {
      user: { select: { firstName: true, lastName: true, mobile: true, role: { select: { name: true } } } },
    },
  });

  return NextResponse.json(approvals);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, approved } = await req.json();
  const record = await prisma.userApproval.update({
    where: { id: Number(id) },
    data: { approved: Number(approved) },
  });

  return NextResponse.json({ success: true, data: record });
}
