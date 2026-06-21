import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { stockService } from "@/services/stock.service";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams } from "@/lib/utils";
import { z } from "zod";
import { StockMovementType } from "@prisma/client";

const stockInSchema = z.object({
  variantId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.coerce.number().min(1),
  unitCost: z.coerce.number().optional(),
  branchId: z.string().min(1),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("warehouse", "view");
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const { page, pageSize } = getPaginationParams(sp);

  const typeParam = sp.get("type");
  const { data, total } = await stockService.getMovements({
    warehouseId: sp.get("warehouseId") || undefined,
    variantId: sp.get("variantId") || undefined,
    type: typeParam ? (typeParam as StockMovementType) : undefined,
    from: sp.get("from") ? new Date(sp.get("from")!) : undefined,
    to: sp.get("to") ? new Date(sp.get("to")!) : undefined,
    page,
    pageSize,
  });

  return paginatedResponse(data, total, page, pageSize);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requirePermission("warehouse", "stock-in");
  if (error) return error;

  const body = await req.json();
  const parsed = stockInSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  try {
    const movement = await stockService.stockIn({
      ...parsed.data,
      branchId: parsed.data.branchId || user!.branchId || "",
    });
    return successResponse(movement, 201);
  } catch (e: any) {
    return errorResponse(e.message, 400);
  }
}
