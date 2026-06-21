import { prisma } from "@/lib/prisma";
import type { CustomerInput } from "@/validators/customer.schema";

export const customerService = {
  async getAll(params: { search?: string; page: number; pageSize: number }) {
    const where = params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" as const } },
            { phone: { contains: params.search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { sales: true, debts: true } },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    return { data, total };
  },

  async getById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        sales: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { items: true },
        },
        debts: {
          orderBy: { createdAt: "desc" },
          include: { payments: true },
        },
        payments: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });
  },

  async create(data: CustomerInput) {
    return prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
      },
    });
  },

  async update(id: string, data: Partial<CustomerInput>) {
    return prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
      },
    });
  },

  async delete(id: string) {
    return prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
