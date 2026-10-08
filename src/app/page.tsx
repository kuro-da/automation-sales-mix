import Link from "next/link";
import type { CSSProperties } from "react";
import { allWorlds } from "@/lib/worlds";
import { getWorldStats, listWorldArtVersions } from "@/lib/crm";
import { STAFF } from "@/lib/staff";
import { worldBackground, worldFont } from "@/lib/worldArt";
import { WorldIllustration } from "@/components/WorldIllustration";

export const dynamic = "force-dynamic";

export default function WorldSelectPage() {
  const total = getWorldStats();
  const art = listWorldArtVersions();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#05060d] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{ backgroundImage: "radial-gradient(circle at 15% 10%, #3b2a8f55, transparent 40%), radial-gradient(circle at 90% 90%, #0e749044, transparent 40%)" }} />

      <header className="relative mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-violet-500 text-sm font-black shadow-lg">MB</span>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-wide">MEDIA BRAIN SALES UNIVERSE</div>
            <div className="text-[11px] text-slate-400">営業ポータル</div>
          </div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/10 px-3 py-1.5">TEAM LV.{total.level}</span>
          <span className="rounded-full bg-white/10 px-3 py-1.5">承認待ち {total.drafts}</span>
          <Link href="/dashboard" className="rounded-full border border-white/25 px-3.5 py-1.5 hover:bg-white/10">ダッシュボード</Link>
          <Link href="/leads" className="rounded-full border border-white/25 px-3.5 py-1.5 hover:bg-white/10">リード</Link>
          <Link href="/outbox" className="rounded-full border border-white/25 px-3.5 py-1.5 hover:bg-white/10">配信キュー</Link>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-4 pt-6 text-center sm:px-8">
        <p className="text-xs font-bold tracking-[0.4em] text-brand-300">SELECT YOUR WORLD</p>
        <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl" style={{ textShadow: "0 0 30px #6366f1aa" }}>
          どの世界で、営業する？
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">事業ごとのワールドを選んでスタート。AI社員6名が、候補発掘から営業文の作成、進行管理までサポートします。</p>
        <div className="mt-5 flex items-center justify-center -space-x-3">
          {STAFF.map((s) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={s.id} src={`/staff/${s.id}-portrait.png`} alt={s.name} title={`${s.name}｜${s.role}`} className="h-12 w-12 rounded-full border-2 border-[#05060d] bg-amber-50 object-cover" />
          ))}
        </div>
      </section>

      <section className="relative mx-auto grid max-w-7xl gap-5 px-5 pb-16 pt-6 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {allWorlds().map((b, i) => {
          const t = b.theme;
          const s = getWorldStats(b.id);
          const style = { ...worldBackground(t), "--acc": t.accent } as CSSProperties;
          return (
            <Link
              key={b.id}
              href={`/b/${b.id}`}
              style={style}
              className="group relative isolate flex min-h-[360px] flex-col overflow-hidden rounded-2xl p-6 ring-1 ring-white/15 transition duration-300 hover:-translate-y-2 hover:ring-2 hover:ring-[var(--acc)] hover:shadow-[0_0_50px_-5px_var(--acc)]"
            >
              {art[b.id] ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/api/world-art/${b.id}?v=${encodeURIComponent(art[b.id])}`} alt="" className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-[78%_50%] transition duration-500 group-hover:scale-105" />
                  <span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/20 to-black/10" /><span className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/25 to-transparent" />
                </>
              ) : (
                <WorldIllustration t={t} className="pointer-events-none absolute right-0 top-10 h-[64%] w-[78%] opacity-95 transition duration-500 group-hover:scale-105" />
              )}
              <span className="pointer-events-none absolute -right-2 -top-6 select-none text-[9rem] font-black leading-none text-white/[0.06]" style={worldFont(t)}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative flex items-center justify-between text-[11px] font-bold tracking-widest">
                <span className="rounded bg-black/40 px-2 py-1" style={{ color: t.accent2 }}>WORLD {String(i + 1).padStart(2, "0")}</span>
                <span className="rounded px-2 py-1 text-white" style={{ backgroundColor: t.accent }}>RANK {s.rank}</span>
              </div>

              <div className="relative mt-8">
                <div className="text-3xl font-black uppercase leading-none sm:text-4xl" style={{ ...worldFont(t), color: t.accent2, textShadow: `0 0 24px ${t.accent}` }}>
                  {t.world}
                </div>
                <div className="mt-2 text-lg font-bold text-white" style={{ textShadow: "0 2px 8px #000a" }}>{t.title}</div>
                <p className="mt-1 text-sm text-white/75">{t.tagline}</p>
                <p className="mt-0.5 text-[11px] text-white/45">{b.name}</p>
              </div>

              <div className="relative mt-auto pt-6">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span>LV.{s.level}</span>
                  <span className="text-white/60">XP {s.xp}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/40">
                  <div className="h-full rounded-full" style={{ width: `${Math.max(4, s.levelProgress)}%`, background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})` }} />
                </div>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-white/80">
                  <span className="rounded-md bg-black/35 px-2 py-1">リード {s.leads}</span>
                  <span className="rounded-md bg-black/35 px-2 py-1">承認待ち {s.drafts}</span>
                  {s.streak > 0 && <span className="rounded-md bg-black/35 px-2 py-1">🔥{s.streak}日連続</span>}
                  <span className="ml-auto rounded-full px-4 py-1.5 text-xs font-black tracking-widest text-white transition group-hover:scale-105" style={{ backgroundColor: t.accent }}>
                    START ▶
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
