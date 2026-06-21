import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { customerService } from "@/services/customer.service";
import { customerSchema } from "@/validators/customer.schema";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("customers", "view");
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const { page, pageSize } = getPaginationParams(sp);
  const { data, total } = await customerService.getAll({
    search: sp.get("search") || undefined,
    page,
    pageSize,
  });
  return paginatedResponse(data, total, page, pageSize);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("customers", "create");
  if (error) return error;

  const body = await req.json();
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  try {
    const customer = await customerService.create(parsed.data);
    return successResponse(customer, 201);
  } catch (e: any) {
    return errorResponse(e.message, 400);
  }
}
