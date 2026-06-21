import { requirePermission } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  const { error } = await requirePermission("roles", "view");
  if (error) return error;

  const permissions = await prisma.permission.findMany({
    orderBy: [{ module: "asc" }, { action: "asc" }],
  });

  // Group by module
  const grouped = permissions.reduce(
    (acc, p) => {
      if (!acc[p.module]) acc[p.module] = [];
      acc[p.module].push(p);
      return acc;
    },
    {} as Record<string, typeof permissions>
  );

  return successResponse(grouped);
}
