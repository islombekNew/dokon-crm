import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { productService } from "@/services/product.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("products", "view");
  if (error) return error;

  const barcode = req.nextUrl.searchParams.get("barcode");
  if (!barcode) return errorResponse("Shtrixkod kiritilishi shart");

  const variant = await productService.searchByBarcode(barcode);
  if (!variant) return errorResponse("Mahsulot topilmadi", 404);
  return successResponse(variant);
}
