import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Mahsulot nomi kamida 2 belgi"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Kategoriya tanlang"),
  brandId: z.string().optional(),
  supplierId: z.string().optional(),
  costPrice: z.coerce.number().min(0, "Narx manfiy bo'lmaydi"),
  sellPrice: z.coerce.number().min(0, "Narx manfiy bo'lmaydi"),
  isActive: z.boolean().default(true),
});

export const variantSchema = z.object({
  productId: z.string().min(1),
  sizeId: z.string().optional(),
  colorId: z.string().optional(),
  barcode: z.string().min(1, "Shtrixkod kiritilishi shart"),
  sku: z.string().optional(),
  costPrice: z.coerce.number().optional(),
  sellPrice: z.coerce.number().optional(),
});

export const categorySchema = z.object({
  name: z.string().min(2, "Kategoriya nomi kamida 2 belgi"),
  parentId: z.string().optional(),
});

export const brandSchema = z.object({
  name: z.string().min(1, "Brend nomi kiritilishi shart"),
});

export const sizeSchema = z.object({
  name: z.string().min(1, "O'lcham nomi kiritilishi shart"),
  sortOrder: z.coerce.number().default(0),
});

export const colorSchema = z.object({
  name: z.string().min(1, "Rang nomi kiritilishi shart"),
  hexCode: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
