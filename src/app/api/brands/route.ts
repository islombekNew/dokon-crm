import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { brandSchema } from "@/validators/product.schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  const { error } = await requirePermission("brands", "view");
  if (error) return error;

  const data = await prisma.brand.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { name: "asc" },
  });
  return successResponse(data);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("brands", "create");
  if (error) return error;

  const body = await req.json();
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  try {
    const brand = await prisma.brand.create({ data: parsed.data });
    return successResponse(brand, 201);
  } catch {
    return errorResponse("Bu nom allaqachon mavjud", 409);
  }
}
