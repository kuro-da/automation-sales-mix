import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorld } from "@/lib/worlds";
import { worldBackground, worldFont } from "@/lib/worldArt";
import { WorldIllustration } from "@/components/WorldIllustration";
import { WorldTabs } from "@/components/WorldTabs";
import { listWorldArtVersions } from "@/lib/crm";
import { autoRunAction } from "../../actions";

/** ワールド共通の枠：ヘッダー（ブランド・検索・操作）＋ タブ。既存オフィスの画面構成を踏襲。 */
export default async function WorldLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = getWorld(id);
  if (!b) notFound();
  const t = b.theme;
  const artV = listWorldArtVersions()[id];
  const mark = b.id === "meat" ? "871" : b.short.slice(0, 3);

  return (
    <div className="space-y-4">
      <header className="relative isolate overflow-hidden rounded-3xl p-4 text-white shadow-xl sm:px-6" style={worldBackground(t)}>
        {artV ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/api/world-art/${id}?v=${encodeURIComponent(artV)}`} alt="" className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[75%_35%] opacity-70" />
            <span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
          </>
        ) : (
          <WorldIllustration t={t} className="pointer-events-none absolute right-[18%] top-[-30%] hidden h-[170%] w-auto opacity-40 md:block" />
        )}
        <div className="relative flex flex-wrap items-center gap-4">
          <Link href="/" title="ワールド選択へ" className="grid h-12 w-12 place-items-center rounded-xl text-sm font-black text-white shadow-lg" style={{ backgroundColor: t.accent }}>
            {mark}
          </Link>
          <div className="min-w-0">
            <div className="text-xl font-black uppercase leading-none sm:text-2xl" style={{ ...worldFont(t), color: t.accent2, textShadow: `0 0 20px ${t.accent}` }}>
              {t.world}
            </div>
            <div className="mt-1 text-xs text-white/75">{t.title}｜{b.name}</div>
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <form action={`/b/${id}/leads`} className="hidden sm:block">
              <input name="q" placeholder="企業名・業態・ブランドを検索" className="w-56 rounded-lg border border-white/25 bg-black/30 px-3 py-2 text-xs text-white placeholder:text-white/50 focus:outline-none" />
            </form>
            <Link href={`/b/${id}/settings`} className="rounded-lg border border-white/30 px-3.5 py-2 text-xs font-bold hover:bg-white/10">会社・商品設定</Link>
            <form action={autoRunAction}>
              <input type="hidden" name="businessId" value={id} />
              <button className="rounded-lg px-4 py-2 text-xs font-black text-white shadow-lg transition hover:scale-105" style={{ backgroundColor: t.accent }}>自動AP開始 ▶</button>
            </form>
          </div>
        </div>
      </header>
      <WorldTabs id={id} accent={t.accent} />
      {children}
    </div>
  );
}
