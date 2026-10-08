import Link from "next/link";
import { BUSINESSES, CHANNEL_LABEL } from "@/lib/businesses";
import { getBusinessStats, getLead, listLeads, listOutbox } from "@/lib/crm";
import { BizBadge } from "@/components/badges";
import { seedDemoAction } from "../actions";

export const dynamic = "force-dynamic";

const STAGE_COLOR = { A: "#38bdf8", B: "#f59e0b", C: "#d946ef", won: "#10b981" } as const;

export default function PortalPage() {
  const stats = new Map(getBusinessStats().map((s) => [s.businessId, s]));
  const leads = listLeads();
  const drafts = listOutbox({ status: "draft" });
  const sent = listOutbox({ status: "sent" });
  const count = (k: "A" | "B" | "C") => leads.filter((l) => l.stage === k).length;
  const won = leads.filter((l) => l.status === "won").length;
  const maxTotal = Math.max(1, ...BUSINESSES.map((b) => stats.get(b.id)?.total ?? 0));
  const todo = drafts.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-brand-900 to-violet-900 p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="text-xs font-semibold tracking-widest text-brand-200">MEDIA BRAIN SALES PORTAL</p>
            <h1 className="mt-2 text-3xl font-black leading-tight">全6事業の営業を、<br />ひとつの流れで自動化。</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              アポ獲得 → 定期フォロー → 失注後の別事業クロスセルまで、配信ドラフトを自動で用意。人が確認して送るから安心です。
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/outbox" className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-lg transition hover:bg-brand-50">
              配信キューを確認{drafts.length > 0 && <span className="ml-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs">{drafts.length}</span>}
            </Link>
            <Link href="/leads#new" className="rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10">
              ＋ リード登録
            </Link>
          </div>
        </div>
      </section>

      {leads.length === 0 && (
        <form action={seedDemoAction} className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm">
          <p className="text-slate-600">まだリードがありません。各事業のサンプルリードを投入して、画面と動きを確認できます。</p>
          <button className="mt-3 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700">デモデータを投入</button>
        </form>
      )}

      {/* KPI */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="全リード" value={leads.length} sub="全事業合計" color="#356bf0" path="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" />
        <Kpi label="承認待ち" value={drafts.length} sub="確認して送信" color="#f59e0b" path="M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z" href="/outbox" />
        <Kpi label="送信・架電済み" value={sent.length} sub="累計の実行数" color="#10b981" path="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        <Kpi label="成約" value={won} sub="配信は自動停止" color="#7c3aed" path="M20 6L9 17l-5-5" />
      </section>

      {/* Flow + Today */}
      <section className="grid gap-6 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-3">
          <h2 className="text-sm font-bold text-slate-800">自動営業フロー</h2>
          <p className="mt-0.5 text-xs text-slate-500">いまどのステージに何件いるか</p>
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-stretch gap-2">
            <FlowNode tag="A" title="アポ獲得" desc="初回案内 → 未反応フォロー → 架電" n={count("A")} color={STAGE_COLOR.A} />
            <Arrow />
            <FlowNode tag="B" title="定期フォロー" desc="安心・共有の情報配信／停滞アラート" n={count("B")} color={STAGE_COLOR.B} />
            <Arrow />
            <FlowNode tag="C" title="別商材提案" desc="失注後に他事業のフックを提案" n={count("C")} color={STAGE_COLOR.C} />
          </div>
          <div className="mt-6 space-y-2.5">
            {BUSINESSES.map((b) => {
              const s = stats.get(b.id);
              const seg = (k: "A" | "B" | "C" | "won") => ((s?.byStage[k] ?? 0) / maxTotal) * 100;
              return (
                <Link key={b.id} href={`/b/${b.id}`} className="group flex items-center gap-3">
                  <span className="w-20 shrink-0 text-xs font-medium text-slate-600 group-hover:text-slate-900">{b.short}</span>
                  <span className="flex h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                    {(["A", "B", "C", "won"] as const).map((k) => (
                      <span key={k} style={{ width: `${seg(k)}%`, backgroundColor: STAGE_COLOR[k] }} />
                    ))}
                  </span>
                  <span className="w-6 text-right text-xs font-semibold tabular-nums text-slate-700">{s?.total ?? 0}</span>
                </Link>
              );
            })}
            <div className="flex gap-4 pt-1 text-[11px] text-slate-500">
              {(["A", "B", "C", "won"] as const).map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: STAGE_COLOR[k] }} />
                  {k === "won" ? "成約" : `Stage ${k}`}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">今日やること</h2>
            <Link href="/outbox" className="text-xs font-semibold text-brand-600 hover:underline">すべて見る</Link>
          </div>
          {todo.length === 0 ? (
            <p className="mt-6 rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-700">承認待ちはありません 🎉</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {todo.map((it) => {
                const lead = getLead(it.leadId);
                return (
                  <li key={it.id}>
                    <Link href="/outbox" className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/40">
                      {lead && <BizBadge id={lead.businessId} />}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800">{lead?.company}</span>
                        <span className="block truncate text-xs text-slate-500">{it.stepKey}・{CHANNEL_LABEL[it.channel]}・{it.subject}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Businesses */}
      <section>
        <h2 className="mb-3 text-sm font-bold text-slate-800">事業ワークスペース</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESSES.map((b) => {
            const s = stats.get(b.id);
            return (
              <Link key={b.id} href={`/b/${b.id}`} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: b.hex }} />
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 transition group-hover:opacity-20" style={{ backgroundColor: b.hex }} />
                <h3 className="relative font-bold text-slate-900">{b.name}</h3>
                <p className="relative mt-1 line-clamp-1 text-xs text-slate-500">{b.audience}</p>
                <div className="relative mt-4 grid grid-cols-4 gap-2 text-center">
                  {(["A", "B", "C", "won"] as const).map((k) => (
                    <div key={k} className="rounded-lg bg-slate-50 py-2">
                      <div className="text-lg font-black text-slate-800">{s?.byStage[k] ?? 0}</div>
                      <div className="text-[10px] font-semibold" style={{ color: STAGE_COLOR[k] }}>{k === "won" ? "成約" : k}</div>
                    </div>
                  ))}
                </div>
                <p className="relative mt-3 text-xs text-slate-500">フック：<span className="font-semibold text-slate-700">{b.hook}</span></p>
                {s && s.pendingDrafts > 0 && <p className="relative mt-2 text-xs font-bold text-amber-600">● 承認待ち {s.pendingDrafts} 件</p>}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value, sub, color, path, href }: { label: string; value: number; sub: string; color: string; path: string; href?: string }) {
  const inner = (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ backgroundColor: `${color}1a`, color }}>
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={path} /></svg>
      </span>
      <div>
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="text-3xl font-black tabular-nums text-slate-900">{value}</div>
        <div className="text-[11px] text-slate-400">{sub}</div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function FlowNode({ tag, title, desc, n, color }: { tag: string; title: string; desc: string; n: number; color: string }) {
  return (
    <div className="rounded-xl border p-3" style={{ borderColor: `${color}66`, backgroundColor: `${color}12` }}>
      <div className="flex items-center gap-2">
        <span className="grid h-6 w-6 place-items-center rounded-md text-xs font-black text-white" style={{ backgroundColor: color }}>{tag}</span>
        <span className="text-sm font-bold text-slate-800">{title}</span>
      </div>
      <div className="mt-2 text-2xl font-black tabular-nums text-slate-900">{n}<span className="ml-1 text-xs font-medium text-slate-500">件</span></div>
      <p className="mt-1 text-[11px] leading-snug text-slate-500">{desc}</p>
    </div>
  );
}

function Arrow() {
  return (
    <div className="grid place-items-center text-slate-300">
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </div>
  );
}
