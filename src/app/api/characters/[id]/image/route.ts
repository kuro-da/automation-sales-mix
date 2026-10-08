import { getCharacterImage } from "@/lib/crm";

export const runtime = "nodejs";

/** 登録キャラクターの画像を返す（DBに保存した画像。URLの ?v= で更新を反映） */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const img = getCharacterImage(id);
  if (!img) return new Response("not found", { status: 404 });
  return new Response(Buffer.from(img.data), {
    headers: { "Content-Type": img.mime || "image/png", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
