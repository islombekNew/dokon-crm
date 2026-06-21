import { prisma } from "@/lib/prisma";
import { generateBarcode } from "@/lib/barcode";

interface CreateVariantData {
  productId: string;
  sizeId?: string;
  colorId?: string;
  sku?: string;
  sellPrice: number;
  costPrice?: number;
  warehouseId?: string;
  initialQuantity?: number;
}

export const variantService = {
  async create(data: CreateVariantData) {
    const barcode = generateBarcode("PRD");

    return prisma.$transaction(async (tx) => {
      const v = await tx.productVariant.create({
        data: {
          productId: data.productId,
          sizeId: data.sizeId || null,
          colorId: data.colorId || null,
          sku: data.sku || null,
          barcode,
          sellPrice: data.sellPrice,
          costPrice: data.costPrice || 0,
        },
        include: { size: true, color: true, product: { select: { name: true } } },
      });

      if (data.warehouseId && data.initialQuantity && data.initialQuantity > 0) {
        await tx.stockItem.create({
          data: { warehouseId: data.warehouseId, variantId: v.id, quantity: data.initialQuantity, minQuantity: 5 },
        });
        const wh = await tx.warehouse.findUnique({ where: { id: data.warehouseId } });
        await tx.stockMovement.create({
          data: {
            type: "IN",
            variantId: v.id,
            toWarehouseId: data.warehouseId,
            quantity: data.initialQuantity,
            branchId: wh!.branchId,
            note: "Dastlabki qoldiq",
          },
        });
      }

      return v;
    });
  },

  async update(id: string, data: Partial<{ sellPrice: number; costPrice: number; sizeId: string; colorId: string; sku: string }>) {
    return prisma.productVariant.update({ where: { id }, data, include: { size: true, color: true } });
  },

  async delete(id: string) {
    return prisma.productVariant.update({ where: { id }, data: { isActive: false } });
  },

  async regenerateBarcode(id: string) {
    const barcode = generateBarcode("PRD");
    return prisma.productVariant.update({ where: { id }, data: { barcode } });
  },

  async searchByBarcode(barcode: string) {
    return prisma.productVariant.findFirst({
      where: { barcode },
      include: {
        product: { include: { category: true, brand: true } },
        size: true,
        color: true,
        stockItems: { include: { warehouse: true } },
      },
    });
  },
};
