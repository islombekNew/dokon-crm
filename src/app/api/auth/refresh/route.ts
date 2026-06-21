import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;
  if (!refreshToken) {
    return NextResponse.json({ error: "Refresh token yo'q" }, { status: 401 });
  }

  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) {
    return NextResponse.json({ error: "Token muddati tugagan" }, { status: 401 });
  }

  const newAccessToken = await signAccessToken(payload);
  const response = NextResponse.json({ success: true });
  response.cookies.set("access_token", newAccessToken, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 900,
    path: "/",
  });

  return response;
}
