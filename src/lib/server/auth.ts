import crypto from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { serverConfig, requireAuthSecret } from "./config";
import { query } from "./db";

export type Role = "learner" | "teacher" | "content_admin" | "admin" | "super_admin";

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  locale: string;
  role: Role;
};

type SessionPayload = {
  userId: string;
  exp: number;
};

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function base64UrlJson(value: unknown) {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function sign(value: string) {
  return crypto
    .createHmac("sha256", requireAuthSecret())
    .update(value)
    .digest("base64url");
}

function parseSessionToken(token: string): SessionPayload | null {
  const [payloadPart, signature] = token.split(".");
  if (!payloadPart || !signature) return null;

  const expected = sign(payloadPart);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);
  if (expectedBuffer.length !== actualBuffer.length || !crypto.timingSafeEqual(expectedBuffer, actualBuffer)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function createSessionToken(userId: string) {
  const payload = base64UrlJson({
    userId,
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  });

  return `${payload}.${sign(payload)}`;
}

export function setSessionCookie(response: NextResponse, userId: string) {
  response.cookies.set({
    name: serverConfig.cookieName,
    value: createSessionToken(userId),
    httpOnly: true,
    sameSite: "lax",
    secure: serverConfig.isProduction,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: serverConfig.cookieName,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: serverConfig.isProduction,
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(serverConfig.cookieName)?.value;
  if (!token) return null;

  const session = parseSessionToken(token);
  if (!session) return null;

  const result = await query<{
    id: string;
    email: string;
    display_name: string;
    locale: string;
    role: Role;
  }>(
    `select id, email, display_name, locale, coalesce(role, 'learner') as role
     from users
     where id = $1
     limit 1`,
    [session.userId],
  );

  const user = result.rows[0];
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    locale: user.locale,
    role: user.role,
  };
}

export function canManageContent(role: Role) {
  return ["content_admin", "admin", "super_admin"].includes(role);
}

export function canSuperviseSystem(role: Role) {
  return role === "super_admin";
}
