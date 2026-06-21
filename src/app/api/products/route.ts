import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { productService } from "@/services/product.service";
import { productSchema } from "@/validators/product.schema";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("products", "view");
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const { page, pageSize, skip } = getPaginationParams(sp);

  const { data, total } = await productService.getAll({
    search: sp.get("search") || undefined,
    categoryId: sp.get("categoryId") || undefined,
    brandId: sp.get("brandId") || undefined,
    isActive: sp.has("isActive") ? sp.get("isActive") === "true" : undefined,
    page,
    pageSize,
  });

  return paginatedResponse(data, total, page, pageSize);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("products", "create");
  if (error) return error;

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message);
    }
    const product = await productService.create(parsed.data);
    return successResponse(product, 201);
  } catch (e: any) {
    return errorResponse(e.message || "Xato", 500);
  }
}
