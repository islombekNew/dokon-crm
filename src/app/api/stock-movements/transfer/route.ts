import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { stockService } from "@/services/stock.service";
import { successResponse, errorResponse } from "@/lib/api-response";
import { z } from "zod";

const transferSchema = z.object({
  variantId: z.string().min(1),
  fromWarehouseId: z.string().min(1),
  toWarehouseId: z.string().min(1),
  quantity: z.coerce.number().min(1),
  branchId: z.string().min(1),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("warehouse", "transfer");
  if (error) return error;

  const body = await req.json();
  const parsed = transferSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  try {
    const movement = await stockService.transfer(parsed.data);
    return successResponse(movement, 201);
  } catch (e: any) {
    return errorResponse(e.message, 400);
  }
}
