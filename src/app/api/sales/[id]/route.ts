import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { saleService } from "@/services/sale.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("sales", "view");
  if (error) return error;
  const { id } = await params;
  const sale = await saleService.getById(id);
  if (!sale) return errorResponse("Sotuv topilmadi", 404);
  return successResponse(sale);
}
