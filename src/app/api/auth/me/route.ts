import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      role: true,
      branch: { select: { id: true, name: true } },
    },
  });

  if (!user || !user.isActive) {
    return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
  }

  const permissions = await getUserPermissions(user.roleId);

  return NextResponse.json({
    success: true,
    data: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      role: { id: user.role.id, name: user.role.name },
      branch: user.branch,
      permissions,
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: { name: body.name, phone: body.phone || null },
  });

  return NextResponse.json({ success: true, data: { id: updated.id, name: updated.name, phone: updated.phone } });
}
