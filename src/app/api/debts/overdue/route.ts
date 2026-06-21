import { requirePermission } from "@/lib/permissions";
import { debtService } from "@/services/debt.service";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  const { error } = await requirePermission("debts", "view");
  if (error) return error;
  const data = await debtService.getOverdueDebts();
  return successResponse(data);
}
