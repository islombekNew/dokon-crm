import { prisma } from "@/lib/prisma";
import { generateSaleNumber } from "@/lib/utils";
import { StockMovementType, SaleStatus, DebtStatus } from "@prisma/client";
import type { CreateSaleInput } from "@/validators/sale.schema";

export const saleService = {
  async create(data: CreateSaleInput, userId: string) {
    const saleNumber = generateSaleNumber();
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity - item.discount,
      0
    ) - data.discount;

    return prisma.$transaction(async (tx) => {
      // Check and reduce stock for each item
      const branch = await tx.branch.findFirst({ where: { id: data.branchId } });
      const defaultWarehouse = await tx.warehouse.findFirst({
        where: { branchId: data.branchId, isDefault: true },
      });
      if (!defaultWarehouse) throw new Error("Filialda ombor topilmadi");

      for (const item of data.items) {
        const stockItem = await tx.stockItem.findUnique({
          where: {
            warehouseId_variantId: {
              warehouseId: defaultWarehouse.id,
              variantId: item.variantId,
            },
          },
        });
        if (!stockItem || stockItem.quantity < item.quantity) {
          throw new Error(`Mahsulot yetarli emas (variant: ${item.variantId})`);
        }
        await tx.stockItem.update({
          where: { warehouseId_variantId: { warehouseId: defaultWarehouse.id, variantId: item.variantId } },
          data: { quantity: { decrement: item.quantity } },
        });

        await tx.stockMovement.create({
          data: {
            type: StockMovementType.SALE,
            variantId: item.variantId,
            fromWarehouseId: defaultWarehouse.id,
            quantity: item.quantity,
            branchId: data.branchId,
          },
        });
      }

      const sale = await tx.sale.create({
        data: {
          saleNumber,
          customerId: data.customerId || null,
          userId,
          branchId: data.branchId,
          totalAmount,
          paidAmount: data.paidAmount,
          discount: data.discount,
          paymentType: data.paymentType as any,
          status: SaleStatus.COMPLETED,
          note: data.note,
          items: {
            create: data.items.map((item) => ({
              variantId: item.variantId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
            })),
          },
        },
        include: { items: true },
      });

      // If payment type is DEBT, create a debt record
      if (data.paymentType === "DEBT" || data.paidAmount < totalAmount) {
        const debtAmount = totalAmount - data.paidAmount;
        if (debtAmount > 0 && data.customerId) {
          await tx.debt.create({
            data: {
              customerId: data.customerId,
              saleId: sale.id,
              totalAmount: debtAmount,
              paidAmount: 0,
              dueDate: data.dueDate ? new Date(data.dueDate) : null,
              status: DebtStatus.ACTIVE,
            },
          });
        }
      }

      return sale;
    });
  },

  async getAll(params: {
    search?: string;
    status?: SaleStatus;
    branchId?: string;
    customerId?: string;
    from?: Date;
    to?: Date;
    page: number;
    pageSize: number;
  }) {
    const where = {
      ...(params.search && {
        OR: [
          { saleNumber: { contains: params.search, mode: "insensitive" as const } },
          { customer: { name: { contains: params.search, mode: "insensitive" as const } } },
        ],
      }),
      ...(params.status && { status: params.status }),
      ...(params.branchId && { branchId: params.branchId }),
      ...(params.customerId && { customerId: params.customerId }),
      ...(params.from && { createdAt: { gte: params.from } }),
      ...(params.to && { createdAt: { lte: params.to } }),
    };

    const [data, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          user: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true } },
          items: {
            include: {
              variant: {
                include: {
                  product: { select: { name: true } },
                  size: true,
                  color: true,
                },
              },
            },
          },
        },
      }),
      prisma.sale.count({ where }),
    ]);

    return { data, total };
  },

  async getById(id: string) {
    return prisma.sale.findUnique({
      where: { id },
      include: {
        customer: true,
        user: { select: { id: true, name: true } },
        branch: true,
        items: {
          include: {
            variant: {
              include: {
                product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
                size: true,
                color: true,
              },
            },
          },
        },
        debt: true,
      },
    });
  },

  async cancel(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUnique({
        where: { id },
        include: { items: true, branch: { include: { warehouses: { where: { isDefault: true } } } } },
      });
      if (!sale) throw new Error("Sotuv topilmadi");
      if (sale.status !== SaleStatus.COMPLETED) throw new Error("Faqat yakunlangan sotuvni bekor qilish mumkin");

      const warehouse = sale.branch.warehouses[0];
      if (!warehouse) throw new Error("Ombor topilmadi");

      for (const item of sale.items) {
        await tx.stockItem.upsert({
          where: { warehouseId_variantId: { warehouseId: warehouse.id, variantId: item.variantId } },
          create: { warehouseId: warehouse.id, variantId: item.variantId, quantity: item.quantity },
          update: { quantity: { increment: item.quantity } },
        });
      }

      return tx.sale.update({
        where: { id },
        data: { status: SaleStatus.CANCELLED },
      });
    });
  },
};
