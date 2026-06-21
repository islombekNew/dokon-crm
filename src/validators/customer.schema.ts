import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 belgi"),
  phone: z
    .string()
    .regex(/^\+998\d{9}$/, "Telefon formati: +998XXXXXXXXX")
    .optional()
    .or(z.literal("")),
  address: z.string().optional(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
