import { getWorldArtImage, listWorldArtVersions } from "@/lib/crm";

export const runtime = "nodejs";

/** ワールドのサムネイル画像（ユーザーが差し替えたもの）。URLの ?v= で更新を反映 */
export async function GET(_req: Request, ctx: { params: Promise<{ biz: string }> }) {
  const { biz } = await ctx.params;
  listWorldArtVersions();
  const img = getWorldArtImage(biz);
  if (!img) return new Response("not found", { status: 404 });
  return new Response(Buffer.from(img.data), {
    headers: { "Content-Type": img.mime, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
