import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { stockService } from "@/services/stock.service";
import { successResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("warehouse", "view");
  if (error) return error;

  const minQty = parseInt(req.nextUrl.searchParams.get("min") || "5", 10);
  const data = await stockService.getLowStock(minQty);
  return successResponse(data);
}
