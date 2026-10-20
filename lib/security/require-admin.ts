import { hasAdminSession } from "@/lib/security/admin-session";
import { isSameOrigin } from "@/lib/site";
import { jsonResponse } from "@/lib/utils";

export function requireAdmin(request: Request): Response | null {
  if (!hasAdminSession(request)) {
    return jsonResponse({ ok: false, message: "Unauthorised" }, 401);
  }
  if (request.method !== "GET" && !isSameOrigin(request)) {
    return jsonResponse({ ok: false, message: "Unauthorised" }, 403);
  }
  return null;
}
