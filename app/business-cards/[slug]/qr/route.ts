import { cardQrPng } from "@/lib/qr";
import { loadPublicCard } from "@/lib/cards";
import { vCardFileName } from "@/lib/vcard";

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

  const png = await cardQrPng(loaded.data.slug);
  const fileName = vCardFileName(loaded.data.slug).replace(/\.vcf$/, "-qr.png");
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
