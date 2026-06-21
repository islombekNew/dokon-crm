import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/permissions";
import { successResponse, errorResponse } from "@/lib/api-response";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;
  if (!user) return NextResponse.json(errorResponse("Avtorizatsiya talab qilinadi"), { status: 401 });

  try {
    const body = await req.json();
    const { oldPassword, newPassword } = schema.parse(body);

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) return NextResponse.json(errorResponse("Foydalanuvchi topilmadi"), { status: 404 });

    const valid = await bcrypt.compare(oldPassword, dbUser.passwordHash);
    if (!valid) return NextResponse.json(errorResponse("Hozirgi parol noto'g'ri"), { status: 400 });

    const hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: user.userId }, data: { passwordHash: hash } });

    return NextResponse.json(successResponse(null));
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json(errorResponse("Noto'g'ri ma'lumotlar"), { status: 400 });
    return NextResponse.json(errorResponse("Server xatosi"), { status: 500 });
  }
}
