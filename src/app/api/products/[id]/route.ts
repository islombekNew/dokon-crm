import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { productService } from "@/services/product.service";
import { productSchema } from "@/validators/product.schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("products", "view");
  if (error) return error;

  const { id } = await params;
  const product = await productService.getById(id);
  if (!product) return errorResponse("Mahsulot topilmadi", 404);
  return successResponse(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("products", "update");
  if (error) return error;

  const { id } = await params;
  try {
    const body = await req.json();
    const parsed = productSchema.partial().safeParse(body);
    if (!parsed.success) return errorResponse(parsed.error.errors[0].message);
    const product = await productService.update(id, parsed.data);
    return successResponse(product);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("products", "delete");
  if (error) return error;

  const { id } = await params;
  try {
    await productService.delete(id);
    return successResponse({ deleted: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
