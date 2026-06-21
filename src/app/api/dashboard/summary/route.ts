import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { reportService } from "@/services/report.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const { user, error } = await requirePermission("dashboard", "view");
  if (error) return error;

  try {
    const branchId = req.nextUrl.searchParams.get("branchId") || user!.branchId || undefined;
    const data = await reportService.getDashboardSummary(branchId);
    return successResponse(data);
  } catch (e) {
    return errorResponse("Ma'lumot olishda xato", 500);
  }
}
