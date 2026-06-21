import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { debtService } from "@/services/debt.service";
import { payDebtSchema } from "@/validators/debt.schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requirePermission("debts", "pay");
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = payDebtSchema.safeParse(body);
  if (!parsed.success) return errorResponse(parsed.error.errors[0].message);

  try {
    const debt = await debtService.pay(id, parsed.data);
    return successResponse(debt);
  } catch (e: any) {
    return errorResponse(e.message, 400);
  }
}
