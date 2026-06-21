import { prisma } from "@/lib/prisma";
import { StockMovementType } from "@prisma/client";

export const stockService = {
  async getStock(warehouseId?: string, variantId?: string) {
    return prisma.stockItem.findMany({
      where: {
        ...(warehouseId && { warehouseId }),
        ...(variantId && { variantId }),
      },
      include: {
        variant: {
          include: {
            product: { select: { name: true } },
            size: true,
            color: true,
          },
        },
        warehouse: true,
      },
    });
  },

  async stockIn(data: {
    variantId: string;
    warehouseId: string;
    quantity: number;
    unitCost?: number;
    branchId: string;
    note?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      await tx.stockItem.upsert({
        where: { warehouseId_variantId: { warehouseId: data.warehouseId, variantId: data.variantId } },
        create: { warehouseId: data.warehouseId, variantId: data.variantId, quantity: data.quantity },
        update: { quantity: { increment: data.quantity } },
      });

      return tx.stockMovement.create({
        data: {
          type: StockMovementType.IN,
          variantId: data.variantId,
          toWarehouseId: data.warehouseId,
          quantity: data.quantity,
          unitCost: data.unitCost,
          branchId: data.branchId,
          note: data.note,
        },
      });
    });
  },

  async stockOut(data: {
    variantId: string;
    warehouseId: string;
    quantity: number;
    branchId: string;
    note?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const stockItem = await tx.stockItem.findUnique({
        where: { warehouseId_variantId: { warehouseId: data.warehouseId, variantId: data.variantId } },
      });
      if (!stockItem || stockItem.quantity < data.quantity) {
        throw new Error("Omborda yetarli mahsulot yo'q");
      }

      await tx.stockItem.update({
        where: { warehouseId_variantId: { warehouseId: data.warehouseId, variantId: data.variantId } },
        data: { quantity: { decrement: data.quantity } },
      });

      return tx.stockMovement.create({
        data: {
          type: StockMovementType.OUT,
          variantId: data.variantId,
          fromWarehouseId: data.warehouseId,
          quantity: data.quantity,
          branchId: data.branchId,
          note: data.note,
        },
      });
    });
  },

  async transfer(data: {
    variantId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    branchId: string;
    note?: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const fromStock = await tx.stockItem.findUnique({
        where: { warehouseId_variantId: { warehouseId: data.fromWarehouseId, variantId: data.variantId } },
      });
      if (!fromStock || fromStock.quantity < data.quantity) {
        throw new Error("Omborda yetarli mahsulot yo'q");
      }

      await tx.stockItem.update({
        where: { warehouseId_variantId: { warehouseId: data.fromWarehouseId, variantId: data.variantId } },
        data: { quantity: { decrement: data.quantity } },
      });

      await tx.stockItem.upsert({
        where: { warehouseId_variantId: { warehouseId: data.toWarehouseId, variantId: data.variantId } },
        create: { warehouseId: data.toWarehouseId, variantId: data.variantId, quantity: data.quantity },
        update: { quantity: { increment: data.quantity } },
      });

      return tx.stockMovement.create({
        data: {
          type: StockMovementType.TRANSFER,
          variantId: data.variantId,
          fromWarehouseId: data.fromWarehouseId,
          toWarehouseId: data.toWarehouseId,
          quantity: data.quantity,
          branchId: data.branchId,
          note: data.note,
        },
      });
    });
  },

  async getLowStock(minQty = 5) {
    return prisma.stockItem.findMany({
      where: { quantity: { lte: minQty } },
      include: {
        variant: {
          include: {
            product: { select: { name: true } },
            size: true,
            color: true,
          },
        },
        warehouse: { select: { name: true } },
      },
      orderBy: { quantity: "asc" },
    });
  },

  async getMovements(params: {
    warehouseId?: string;
    variantId?: string;
    type?: StockMovementType;
    from?: Date;
    to?: Date;
    page: number;
    pageSize: number;
  }) {
    const where = {
      ...(params.warehouseId && {
        OR: [{ fromWarehouseId: params.warehouseId }, { toWarehouseId: params.warehouseId }],
      }),
      ...(params.variantId && { variantId: params.variantId }),
      ...(params.type && { type: params.type }),
      ...(params.from && { createdAt: { gte: params.from } }),
      ...(params.to && { createdAt: { lte: params.to } }),
    };

    const [data, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          variant: {
            include: {
              product: { select: { name: true } },
              size: true,
              color: true,
            },
          },
          fromWarehouse: { select: { name: true } },
          toWarehouse: { select: { name: true } },
        },
      }),
      prisma.stockMovement.count({ where }),
    ]);

    return { data, total };
  },
};
