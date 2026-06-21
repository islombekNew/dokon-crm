import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { JWTPayload } from "@/lib/auth";

export async function getUserPermissions(roleId: string): Promise<string[]> {
  const rolePerms = await prisma.rolePermission.findMany({
    where: { roleId },
    include: { permission: true },
  });
  return rolePerms.map((rp) => `${rp.permission.module}:${rp.permission.action}`);
}

export async function hasPermission(roleId: string, module: string, action: string): Promise<boolean> {
  const isSuper = await isSuperAdmin(roleId);
  if (isSuper) return true;
  const count = await prisma.rolePermission.count({
    where: { roleId, permission: { module, action } },
  });
  return count > 0;
}

export async function isSuperAdmin(roleId: string): Promise<boolean> {
  const role = await prisma.role.findUnique({ where: { id: roleId } });
  return role?.name === "SUPERADMIN";
}

export async function requireAuth(): Promise<{ user: JWTPayload | null; error: NextResponse | null }> {
  const user = await getSessionUser();
  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ success: false, error: "Avtorizatsiya talab qilinadi" }, { status: 401 }),
    };
  }
  return { user, error: null };
}

export async function requirePermission(
  module: string,
  action: string
): Promise<{ user: JWTPayload | null; error: NextResponse | null }> {
  const { user, error } = await requireAuth();
  if (error || !user) return { user: null, error: error! };

  const isSuper = await isSuperAdmin(user.roleId);
  if (!isSuper) {
    const allowed = await hasPermission(user.roleId, module, action);
    if (!allowed) {
      return {
        user: null,
        error: NextResponse.json({ success: false, error: "Bu amalni bajarish uchun ruxsat yo'q" }, { status: 403 }),
      };
    }
  }

  return { user, error: null };
}
