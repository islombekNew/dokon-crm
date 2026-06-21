import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams } from "@/lib/utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("suppliers", "view");
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const { page, pageSize, skip } = getPaginationParams(sp);
  const search = sp.get("search") || "";
  const where = search ? { name: { contains: search, mode: "insensitive" as const } } : {};

  const [data, total] = await Promise.all([
    prisma.supplier.findMany({ where, include: { _count: { select: { products: true } } }, orderBy: { name: "asc" }, skip, take: pageSize }),
    prisma.supplier.count({ where }),
  ]);

  return NextResponse.json(paginatedResponse(data, total, page, pageSize));
}

export async function POST(req: NextRequest) {
  const { error } = await requirePermission("suppliers", "create");
  if (error) return error;

  try {
    const body = await req.json();
    const data = createSchema.parse(body);
    const supplier = await prisma.supplier.create({
      data: { name: data.name, phone: data.phone || null, email: data.email || null, address: data.address || null, contactPerson: data.contactPerson || null },
    });
    return NextResponse.json(successResponse(supplier), { status: 201 });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(errorResponse("Noto'g'ri ma'lumotlar"), { status: 400 });
    return NextResponse.json(errorResponse("Server xatosi"), { status: 500 });
  }
}
