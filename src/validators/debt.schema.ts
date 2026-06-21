import { z } from "zod";

export const payDebtSchema = z.object({
  amount: z.coerce.number().min(1, "To'lov summasi 0 dan katta bo'lishi kerak"),
  type: z.enum(["CASH", "CARD", "TRANSFER"]).default("CASH"),
  note: z.string().optional(),
});

export const createDebtSchema = z.object({
  customerId: z.string().min(1, "Mijoz tanlang"),
  totalAmount: z.coerce.number().min(1, "Summa kiritilishi shart"),
  dueDate: z.string().optional(),
  note: z.string().optional(),
});

export type PayDebtInput = z.infer<typeof payDebtSchema>;
export type CreateDebtInput = z.infer<typeof createDebtSchema>;
