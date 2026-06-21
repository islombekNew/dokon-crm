import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { colorSchema } from "@/validators/product.schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET() {
  const { error } = await requirePermission("colors", "view");
  if (error) return error;
  const data = await prisma.color.findMany({ orderBy: { name: "asc" } });
  return successResponse(data);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("colors", "manage");
  if (error) return error;
  const body = await req.json();
  const parsed = colorSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);
  try {
    const color = await prisma.color.create({ data: { name: parsed.data.name, hexCode: parsed.data.hexCode || null } });
    return successResponse(color, 201);
  } catch {
    return errorResponse("Bu rang allaqachon mavjud", 409);
  }
}
