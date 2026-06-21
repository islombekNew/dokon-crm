import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { productService } from "@/services/product.service";
import { successResponse } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("products", "view");
  if (error) return error;
  const barcode = await productService.generateBarcode();
  return successResponse({ barcode });
}
