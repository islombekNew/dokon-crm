import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/validators/product.schema";
import { successResponse, errorResponse } from "@/lib/api-response";
import { slugify } from "@/lib/utils";

export async function GET() {
  const { error } = await requirePermission("categories", "view");
  if (error) return error;

  const data = await prisma.category.findMany({
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });
  return successResponse(data);
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("categories", "create");
  if (error) return error;

  const body = await req.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  try {
    const slug = slugify(parsed.data.name) + "-" + Date.now().toString(36);
    const category = await prisma.category.create({
      data: { ...parsed.data, slug, parentId: parsed.data.parentId || null },
    });
    return successResponse(category, 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
