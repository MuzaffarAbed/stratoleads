import { cardQrPng } from "@/lib/qr";
import { requireAdmin } from "@/lib/security/require-admin";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const slug = new URL(request.url).searchParams.get("slug")?.trim().toLowerCase() || "";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return new Response("Not found", { status: 404 });
  }

  const png = await cardQrPng(slug);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${slug}-qr.png"`,
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
