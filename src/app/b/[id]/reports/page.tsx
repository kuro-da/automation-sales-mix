import { notFound } from "next/navigation";
import { CHANNEL_LABEL, getBusiness } from "@/lib/businesses";
import { listLeads, listOutbox } from "@/lib/crm";
import { STAGE_LABEL } from "@/lib/sequences";
import { STATUS_LABEL } from "@/components/badges";

export const dynamic = "force-dynamic";

export default async function WorldReportsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = getBusiness(id);
  if (!b) notFound();
  const t = b.theme;
  const leads = listLeads({ businessId: id });
  const ids = new Set(leads.map((l) => l.id));
  const items = listOutbox().filter((o) => ids.has(o.leadId));

  const count = (keys: string[], pick: (l: (typeof leads)[number]) => string | boolean) => {
    const o: Record<string, number> = Object.fromEntries(keys.map((k) => [k, 0]));
    for (const l of leads) {
      const v = pick(l);
      if (typeof v === "string" && v in o) o[v]++;
    }
    return o;
  };
  const status = count(Object.values(STATUS_LABEL), (l) => STATUS_LABEL[l.status]);
  const stage = count(["A", "B", "C", "done"].map((k) => STAGE_LABEL[k as keyof typeof STAGE_LABEL]), (l) => STAGE_LABEL[l.stage]);
  const contact: Record<string, number> = { メール: 0, 電話: 0, LINE: 0, Web: 0 };
  for (const l of leads) {
    if (l.email) contact["メール"]++;
    if (l.phone) contact["電話"]++;
    if (l.lineId) contact["LINE"]++;
    if (l.meta.sourceUrl) contact["Web"]++;
  }
  const rank: Record<string, number> = { A: 0, B: 0, C: 0 };
  for (const l of leads) if (l.meta.rank && String(l.meta.rank) in rank) rank[String(l.meta.rank)]++;
  const channel: Record<string, number> = { メール: 0, LINE: 0, 架電タスク: 0 };
  for (const o of items.filter((x) => x.status === "sent")) channel[o.channel === "email" ? "メール" : o.channel === "line" ? "LINE" : "架電タスク"]++;

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-black tracking-widest text-slate-400">SALES REPORT</div>
        <h1 className="text-xl font-black text-slate-900">営業レポート</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Report title="ステータス別" data={status} accent={t.accent} accent2={t.accent2} />
        <Report title="ステージ別（A→B→C）" data={stage} accent={t.accent} accent2={t.accent2} />
        <Report title="連絡手段の登録状況" data={contact} accent={t.accent} accent2={t.accent2} />
        <Report title="ランク別" data={rank} accent={t.accent} accent2={t.accent2} />
        <Report title="アプローチ履歴（実施済み）" data={channel} accent={t.accent} accent2={t.accent2} />
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">KPI（{CHANNEL_LABEL[b.primaryChannel]}主体）</h2>
          <ul className="space-y-1.5 text-sm text-slate-700">
            {b.kpis.map((k) => <li key={k} className="flex gap-2"><span style={{ color: t.accent }}>◆</span>{k}</li>)}
          </ul>
          <p className="mt-3 text-xs text-slate-400">各KPIの自動集計は返信の記録・計測を入れる次のフェーズで対応します。</p>
        </section>
      </div>
    </div>
  );
}

function Report({ title, data, accent, accent2 }: { title: string; data: Record<string, number>; accent: string; accent2: string }) {
  const max = Math.max(1, ...Object.values(data));
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-slate-800">{title}</h2>
      <div className="space-y-2">
        {Object.entries(data).map(([k, v]) => (
          <div key={k} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-2 text-xs">
            <span className="truncate text-slate-600">{k}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-slate-100">
              <span className="block h-full rounded-full" style={{ width: `${(v / max) * 100}%`, background: `linear-gradient(90deg, ${accent}, ${accent2})` }} />
            </span>
            <b className="text-right tabular-nums text-slate-900">{v}</b>
          </div>
        ))}
      </div>
    </section>
  );
}
