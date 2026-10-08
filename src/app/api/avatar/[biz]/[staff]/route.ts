import { getBusiness } from "@/lib/businesses";
import { avatarSvg, STAFF_INDEX } from "@/lib/avatar";

export const runtime = "nodejs";

/** ワールドごとのAI社員のキャラクター画像（SVG） */
export async function GET(_req: Request, ctx: { params: Promise<{ biz: string; staff: string }> }) {
  const { biz, staff } = await ctx.params;
  const b = getBusiness(biz);
  const idx = STAFF_INDEX.indexOf(staff);
  if (!b || idx < 0) return new Response("not found", { status: 404 });
  return new Response(avatarSvg(b.theme, idx), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
