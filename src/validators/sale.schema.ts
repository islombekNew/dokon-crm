import { z } from "zod";

export const saleItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().min(1, "Miqdor kamida 1 bo'lishi kerak"),
  unitPrice: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
});

export const createSaleSchema = z.object({
  customerId: z.string().optional(),
  branchId: z.string().min(1, "Filial tanlang"),
  items: z.array(saleItemSchema).min(1, "Kamida 1 mahsulot qo'shing"),
  paymentType: z.enum(["CASH", "CARD", "TRANSFER", "MIXED", "DEBT"]),
  paidAmount: z.coerce.number().min(0),
  discount: z.coerce.number().min(0).default(0),
  note: z.string().optional(),
  dueDate: z.string().optional(),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
