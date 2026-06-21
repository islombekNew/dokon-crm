import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { getPaginationParams } from "@/lib/utils";
import { z } from "zod";

const expenseSchema = z.object({
  title: z.string().min(1),
  amount: z.coerce.number().min(1),
  categoryName: z.string().min(1),
  branchId: z.string().min(1),
  note: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("expenses", "view");
  if (error) return error;

  const sp = req.nextUrl.searchParams;
  const { page, pageSize } = getPaginationParams(sp);

  const where = {
    ...(sp.get("branchId") && { branchId: sp.get("branchId")! }),
    ...(sp.get("from") && { createdAt: { gte: new Date(sp.get("from")!) } }),
    ...(sp.get("to") && { createdAt: { lte: new Date(sp.get("to")!) } }),
  };

  const [data, total] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        branch: { select: { name: true } },
        user: { select: { name: true } },
      },
    }),
    prisma.expense.count({ where }),
  ]);

  return paginatedResponse(data, total, page, pageSize);
}

export async function POST(req: NextRequest) {
  const { user, error } = await requirePermission("expenses", "create");
  if (error) return error;

  const body = await req.json();
  const parsed = expenseSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  try {
    const expense = await prisma.expense.create({
      data: { ...parsed.data, userId: user!.userId, note: parsed.data.note || null },
    });
    return successResponse(expense, 201);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
