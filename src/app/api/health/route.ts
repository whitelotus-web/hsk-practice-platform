import { pingDatabase } from "@/lib/server/db";
import { handleRouteError, ok } from "@/lib/server/http";

export const runtime = "nodejs";

export async function GET() {
  try {
    return ok({
      service: "hsk-practice-platform",
      status: "ok",
      database: await pingDatabase(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
