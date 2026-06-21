import { prisma } from "@/lib/prisma";
import { DebtStatus } from "@prisma/client";
import type { PayDebtInput } from "@/validators/debt.schema";

export const debtService = {
  async getAll(params: {
    customerId?: string;
    status?: DebtStatus;
    overdue?: boolean;
    page: number;
    pageSize: number;
  }) {
    const now = new Date();
    const where = {
      ...(params.customerId && { customerId: params.customerId }),
      ...(params.status && { status: params.status }),
      ...(params.overdue && {
        status: DebtStatus.ACTIVE,
        dueDate: { lt: now },
      }),
    };

    const [data, total] = await Promise.all([
      prisma.debt.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          sale: { select: { id: true, saleNumber: true } },
          payments: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      }),
      prisma.debt.count({ where }),
    ]);

    const enriched = data.map((d) => ({
      ...d,
      remainingAmount: Number(d.totalAmount) - Number(d.paidAmount),
      isOverdue: d.dueDate ? d.dueDate < now && d.status === DebtStatus.ACTIVE : false,
    }));

    return { data: enriched, total };
  },

  async getById(id: string) {
    const debt = await prisma.debt.findUnique({
      where: { id },
      include: {
        customer: true,
        sale: { include: { items: { include: { variant: { include: { product: true } } } } } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    });
    if (!debt) return null;
    return {
      ...debt,
      remainingAmount: Number(debt.totalAmount) - Number(debt.paidAmount),
    };
  },

  async pay(id: string, data: PayDebtInput) {
    return prisma.$transaction(async (tx) => {
      const debt = await tx.debt.findUnique({ where: { id } });
      if (!debt) throw new Error("Qarz topilmadi");
      if (debt.status === DebtStatus.PAID) throw new Error("Qarz allaqachon to'langan");

      const remaining = Number(debt.totalAmount) - Number(debt.paidAmount);
      if (data.amount > remaining) throw new Error("To'lov summasi qarz miqdoridan ko'p");

      const newPaid = Number(debt.paidAmount) + data.amount;
      const isPaid = newPaid >= Number(debt.totalAmount);

      await tx.payment.create({
        data: {
          customerId: debt.customerId,
          debtId: id,
          amount: data.amount,
          type: data.type as any,
          note: data.note,
        },
      });

      return tx.debt.update({
        where: { id },
        data: {
          paidAmount: newPaid,
          status: isPaid ? DebtStatus.PAID : DebtStatus.ACTIVE,
        },
      });
    });
  },

  async getOverdueDebts() {
    const now = new Date();
    return prisma.debt.findMany({
      where: {
        status: DebtStatus.ACTIVE,
        dueDate: { lt: now },
      },
      include: {
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { dueDate: "asc" },
    });
  },

  async updateOverdueStatus() {
    const now = new Date();
    return prisma.debt.updateMany({
      where: {
        status: DebtStatus.ACTIVE,
        dueDate: { lt: now },
      },
      data: { status: DebtStatus.OVERDUE },
    });
  },
};
