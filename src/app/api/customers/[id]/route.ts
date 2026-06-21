import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { customerService } from "@/services/customer.service";
import { customerSchema } from "@/validators/customer.schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("customers", "view");
  if (error) return error;
  const { id } = await params;
  const customer = await customerService.getById(id);
  if (!customer) return errorResponse("Mijoz topilmadi", 404);
  return successResponse(customer);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("customers", "update");
  if (error) return error;
  const { id } = await params;
  const body = await req.json();
  const parsed = customerSchema.partial().safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);
  try {
    const customer = await customerService.update(id, parsed.data);
    return successResponse(customer);
  } catch (e: any) {
    return errorResponse(e.message);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("customers", "delete");
  if (error) return error;
  const { id } = await params;
  await customerService.delete(id);
  return successResponse({ deleted: true });
}
