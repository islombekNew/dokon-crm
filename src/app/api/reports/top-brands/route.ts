import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/permissions";
import { reportService } from "@/services/report.service";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("reports", "view");
  if (error) return error;
  const sp = req.nextUrl.searchParams;
  const from = sp.get("from") ? new Date(sp.get("from")!) : new Date(new Date().setDate(1));
  const to = sp.get("to") ? new Date(sp.get("to")!) : new Date();
  try {
    const data = await reportService.getTopBrands({ from, to, branchId: sp.get("branchId") || undefined });
    return successResponse(data);
  } catch (e: any) {
    return errorResponse(e.message, 500);
  }
}
