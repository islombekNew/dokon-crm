import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken, verifyRefreshToken, signAccessToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth/login"];
const API_AUTH_REFRESH = "/api/auth/refresh";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/public")
  ) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Verify access token
  if (accessToken) {
    const user = await verifyAccessToken(accessToken);
    if (user) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", user.userId);
      requestHeaders.set("x-user-role", user.roleName);
      requestHeaders.set("x-role-id", user.roleId);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
  }

  // Try refresh token
  if (refreshToken && pathname !== API_AUTH_REFRESH) {
    const user = await verifyRefreshToken(refreshToken);
    if (user) {
      const newAccessToken = await signAccessToken(user);
      const response = pathname.startsWith("/api")
        ? NextResponse.next()
        : NextResponse.redirect(new URL(pathname, request.url));

      response.cookies.set("access_token", newAccessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 900,
        path: "/",
      });
      return response;
    }
  }

  // Redirect to login
  if (pathname.startsWith("/api")) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
