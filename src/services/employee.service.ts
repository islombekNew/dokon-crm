import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const employeeService = {
  async getAll(params: { search?: string; branchId?: string; roleId?: string; page: number; pageSize: number }) {
    const where = {
      ...(params.search && {
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { email: { contains: params.search, mode: "insensitive" as const } },
        ],
      }),
      ...(params.branchId && { branchId: params.branchId }),
      ...(params.roleId && { roleId: params.roleId }),
    };

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true, name: true, email: true, phone: true,
          avatar: true, isActive: true, createdAt: true,
          role: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { data, total };
  },

  async getById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true,
        avatar: true, isActive: true, createdAt: true,
        role: { select: { id: true, name: true } },
        branch: { select: { id: true, name: true } },
      },
    });
  },

  async create(data: { name: string; email: string; phone?: string; password: string; roleId: string; branchId?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error("Bu email allaqachon ro'yxatdan o'tgan");

    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        passwordHash,
        roleId: data.roleId,
        branchId: data.branchId || null,
      },
    });
  },

  async update(id: string, data: { name?: string; phone?: string; roleId?: string; branchId?: string; isActive?: boolean }) {
    return prisma.user.update({
      where: { id },
      data: {
        ...data,
        phone: data.phone || null,
        branchId: data.branchId || null,
      },
    });
  },

  async resetPassword(id: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 12);
    return prisma.user.update({ where: { id }, data: { passwordHash } });
  },

  async getRoles() {
    return prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
        _count: { select: { users: true } },
      },
    });
  },

  async updateRolePermissions(roleId: string, permissionIds: string[]) {
    return prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({ where: { roleId } });
      if (permissionIds.length) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((pid) => ({ roleId, permissionId: pid })),
        });
      }
    });
  },
};
