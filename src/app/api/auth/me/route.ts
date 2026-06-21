import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPermissions } from "@/lib/permissions";
import { z } from "zod";

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

const updateProfileSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 belgi").max(100).trim(),
  phone: z.string().max(20).trim().optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser();
  if (!session) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.userId },
    data: { name: parsed.data.name, phone: parsed.data.phone ?? null },
  });

  return NextResponse.json({ success: true, data: { id: updated.id, name: updated.name, phone: updated.phone } });
}
