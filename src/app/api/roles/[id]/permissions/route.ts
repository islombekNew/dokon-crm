import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { employeeService } from "@/services/employee.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("roles", "manage");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const permissionIds: string[] = body.permissionIds || [];

  try {
    await employeeService.updateRolePermissions(id, permissionIds);
    return successResponse({ updated: true });
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
