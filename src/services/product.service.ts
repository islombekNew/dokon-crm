import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { generateBarcode } from "@/lib/barcode";
import type { ProductInput, VariantInput } from "@/validators/product.schema";

export const productService = {
  async getAll(params: {
    search?: string;
    categoryId?: string;
    brandId?: string;
    isActive?: boolean;
    page: number;
    pageSize: number;
  }) {
    const where = {
      ...(params.search && {
        name: { contains: params.search, mode: "insensitive" as const },
      }),
      ...(params.categoryId && { categoryId: params.categoryId }),
      ...(params.brandId && { brandId: params.brandId }),
      ...(params.isActive !== undefined && { isActive: params.isActive }),
    };

    const [data, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { id: true, name: true } },
          brand: { select: { id: true, name: true } },
          images: { where: { isPrimary: true }, take: 1 },
          variants: {
            include: {
              stockItems: { select: { quantity: true } },
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, total };
  },

  async getById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        supplier: true,
        images: true,
        variants: {
          include: {
            size: true,
            color: true,
            stockItems: { include: { warehouse: true } },
          },
        },
      },
    });
  },

  async create(data: ProductInput) {
    const slug = slugify(data.name) + "-" + Date.now().toString(36);
    return prisma.product.create({
      data: {
        ...data,
        slug,
        brandId: data.brandId || null,
        supplierId: data.supplierId || null,
      },
    });
  },

  async update(id: string, data: Partial<ProductInput>) {
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        brandId: data.brandId || null,
        supplierId: data.supplierId || null,
      },
    });
  },

  async delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  async createVariant(data: VariantInput) {
    return prisma.productVariant.create({
      data: {
        ...data,
        sizeId: data.sizeId || null,
        colorId: data.colorId || null,
        sku: data.sku || null,
        costPrice: data.costPrice ?? null,
        sellPrice: data.sellPrice ?? null,
      },
    });
  },

  async generateBarcode() {
    let barcode: string;
    do {
      barcode = generateBarcode("RC");
    } while (await prisma.productVariant.findUnique({ where: { barcode } }));
    return barcode;
  },

  async searchByBarcode(barcode: string) {
    return prisma.productVariant.findUnique({
      where: { barcode },
      include: {
        product: {
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
        size: true,
        color: true,
        stockItems: true,
      },
    });
  },
};
