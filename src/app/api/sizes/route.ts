import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { sizeSchema } from "@/validators/product.schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  const { error } = await requirePermission("sizes", "view");
  if (error) return error;
  const data = await prisma.size.findMany({ orderBy: { sortOrder: "asc" } });
  return successResponse(data);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("sizes", "manage");
  if (error) return error;
  const body = await req.json();
  const parsed = sizeSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);
  try {
    const size = await prisma.size.create({ data: parsed.data });
    return successResponse(size, 201);
  } catch {
    return errorResponse("Bu o'lcham allaqachon mavjud", 409);
  }
}
