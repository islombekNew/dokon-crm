import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { employeeService } from "@/services/employee.service";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams } from "@/lib/utils";
import { z } from "zod";

const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  roleId: z.string().min(1),
  branchId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("employees", "view");
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const { page, pageSize } = getPaginationParams(sp);
  const { data, total } = await employeeService.getAll({
    search: sp.get("search") || undefined,
    branchId: sp.get("branchId") || undefined,
    roleId: sp.get("roleId") || undefined,
    page,
    pageSize,
  });
  return paginatedResponse(data, total, page, pageSize);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("employees", "manage");
  if (error) return error;

  const body = await req.json();
  const parsed = createEmployeeSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  try {
    const employee = await employeeService.create(parsed.data);
    return successResponse(employee, 201);
  } catch (e: any) {
    return errorResponse(e.message, 400);
  }
}
