import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { productService } from "@/services/product.service";
import { variantSchema } from "@/validators/product.schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("products", "create");
  if (error) return error;

  const body = await req.json();
  const parsed = variantSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  try {
    const variant = await productService.createVariant(parsed.data);
    return successResponse(variant, 201);
  } catch (e: any) {
    return errorResponse(e.message || "Variant qo'shishda xato", 500);
  }
}
