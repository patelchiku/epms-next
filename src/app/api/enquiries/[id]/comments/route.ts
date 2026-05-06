import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const user = session.user as any;
  const body = await req.json();

  const comment = await prisma.enquiryComment.create({
    data: {
      enquiryId: Number(id),
      userId: Number(user.id),
      activityId: body.activityId || null,
      remark: body.remark,
      nfd: body.nfd ? new Date(body.nfd) : null,
    },
    include: {
      user: { select: { firstName: true, lastName: true } },
      activity: { select: { name: true } },
    },
  });

  if (body.nfd) {
    await prisma.enquiry.update({
      where: { id: Number(id) },
      data: { nfd: new Date(body.nfd) },
    });
  }

  return NextResponse.json({ success: true, data: comment }, { status: 201 });
}
