import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (!jwtSecret || !jwtRefreshSecret) {
  throw new Error("JWT_SECRET va JWT_REFRESH_SECRET environment variable o'rnatilmagan");
}

const ACCESS_SECRET = new TextEncoder().encode(jwtSecret);
const REFRESH_SECRET = new TextEncoder().encode(jwtRefreshSecret);

const ACCESS_TTL = "15m";
const REFRESH_TTL = "7d";
const IS_PROD = process.env.NODE_ENV === "production";

export interface JWTPayload {
  userId: string;
  email: string;
  roleId: string;
  roleName: string;
  branchId?: string | null;
}

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TTL)
    .sign(ACCESS_SECRET);
}

export async function signRefreshToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TTL)
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.headers.append(
    "Set-Cookie",
    `access_token=${accessToken}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900${IS_PROD ? "; Secure" : ""}`
  );
  res.headers.append(
    "Set-Cookie",
    `refresh_token=${refreshToken}; Path=/api/auth; HttpOnly; SameSite=Strict; Max-Age=604800${IS_PROD ? "; Secure" : ""}`
  );
}
