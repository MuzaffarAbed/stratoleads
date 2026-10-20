import { loadPublicCard } from "@/lib/cards";
import { buildVCard, vCardFileName } from "@/lib/vcard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug } = await context.params;
  const loaded = await loadPublicCard(slug);
  if (loaded.status !== "ok" || !loaded.data) {
    return new Response("This digital card is unavailable.", { status: 404 });
  }

  return new Response(buildVCard(loaded.data), {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${vCardFileName(loaded.data.slug)}"`,
      "Cache-Control": "no-store",
    },
  });
}
