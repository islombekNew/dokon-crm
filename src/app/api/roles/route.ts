import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { employeeService } from "@/services/employee.service";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  const { error } = await requirePermission("roles", "view");
  if (error) return error;
  const roles = await employeeService.getRoles();
  return successResponse(roles);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("roles", "manage");
  if (error) return error;

  const body = await req.json();
  if (!body.name) return errorResponse("Rol nomi kiritilishi shart");

  try {
    const role = await prisma.role.create({
      data: { name: body.name, description: body.description || null },
    });
    return successResponse(role, 201);
  } catch {
    return errorResponse("Bu nom allaqachon mavjud", 409);
  }
}
