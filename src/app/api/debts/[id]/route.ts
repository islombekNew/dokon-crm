import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await requirePermission("debts", "view");
  if (error) return error;
  const debt = await prisma.debt.findUnique({
    where: { id: params.id },
    include: {
      customer: true,
      sale: { select: { saleNumber: true, totalAmount: true } },
      payments: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
    },
  });
  if (!debt) return NextResponse.json(errorResponse("Topilmadi"), { status: 404 });
  return NextResponse.json(successResponse(debt));
}
