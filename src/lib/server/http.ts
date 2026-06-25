import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DATABASE_NOT_CONFIGURED"
  | "INTERNAL_ERROR";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(status: number, code: ApiErrorCode, message: string, details?: unknown) {
  return NextResponse.json(
    {
      ok: false,
      error: {
        code,
        message,
        details,
      },
    },
    { status },
  );
}

type ParsedJson<T> =
  | { body: T; error: null }
  | { body: null; error: NextResponse };

export async function parseJson<T extends Record<string, unknown> = Record<string, unknown>>(
  request: Request,
): Promise<ParsedJson<T>> {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return { body: null, error: fail(400, "BAD_REQUEST", "Request body must be a JSON object.") };
    }

    return { body: body as T, error: null };
  } catch {
    return { body: null, error: fail(400, "BAD_REQUEST", "Invalid JSON body.") };
  }
}

export function getString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  return typeof value === "string" ? value.trim() : "";
}

export function getNumber(body: Record<string, unknown>, key: string) {
  const value = body[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function handleRouteError(error: unknown) {
  if (error instanceof Error && error.message === "DATABASE_URL is not configured.") {
    return fail(503, "DATABASE_NOT_CONFIGURED", "DATABASE_URL is not configured for this backend.");
  }

  console.error(error);
  return fail(500, "INTERNAL_ERROR", "Unexpected server error.");
}
