import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { saleService } from "@/services/sale.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requirePermission("sales", "cancel");
  if (error) return error;
  const { id } = await params;
  try {
    const sale = await saleService.cancel(id, user!.userId);
    return successResponse(sale);
  } catch (e: any) {
    return errorResponse(e.message, 400);
  }
}
