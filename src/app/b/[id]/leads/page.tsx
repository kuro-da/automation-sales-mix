import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusiness } from "@/lib/businesses";
import { listLeads, type Lead } from "@/lib/crm";
import { StageBadge, STATUS_LABEL } from "@/components/badges";

export const dynamic = "force-dynamic";

const FILTERS: [string, string, (l: Lead) => boolean][] = [
  ["all", "すべて", () => true],
  ["A", "A 候補・アポ獲得", (l) => l.stage === "A"],
  ["B", "B フォロー中", (l) => l.stage === "B"],
  ["C", "C 別商材", (l) => l.stage === "C"],
  ["won", "成約", (l) => l.status === "won"],
  ["review", "確認前のみ", (l) => l.meta.verified === "no"],
];

const sel = "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs";

export default async function WorldLeadsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ f?: string; q?: string; area?: string; type?: string; rank?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const b = getBusiness(id);
  if (!b) notFound();
  const t = b.theme;
  const all = listLeads({ businessId: id });
  const f = FILTERS.find(([k]) => k === sp.f) ?? FILTERS[0];
  const q = (sp.q ?? "").trim().toLowerCase();
  const areas = [...new Set(all.map((l) => String(l.meta.area ?? "")).filter(Boolean))];
  const types = [...new Set(all.map((l) => String(l.meta.type ?? "")).filter(Boolean))];

  const rows = all.filter(f[2]).filter((l) => {
    if (sp.area && l.meta.area !== sp.area) return false;
    if (sp.type && l.meta.type !== sp.type) return false;
    if (sp.rank && l.meta.rank !== sp.rank) return false;
    if (q && !`${l.company} ${l.meta.type ?? ""} ${l.meta.brand ?? ""} ${l.meta.area ?? ""} ${l.notes}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const qs = (over: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries({ f: sp.f, q: sp.q, area: sp.area, type: sp.type, rank: sp.rank, ...over })) if (v) p.set(k, v);
    const s = p.toString();
    return `/b/${id}/leads${s ? "?" + s : ""}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-black tracking-widest text-slate-400">LEAD BOARD</div>
        <h1 className="text-xl font-black text-slate-900">営業候補一覧</h1>
      </div>

      <div className="flex flex-wrap gap-1.5 text-xs font-bold">
        {FILTERS.map(([k, label, fn]) => {
          const active = f[0] === k;
          return (
            <Link key={k} href={qs({ f: k === "all" ? undefined : k })} className={`rounded-full px-3.5 py-1.5 ${active ? "text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`} style={active ? { backgroundColor: t.accent } : undefined}>
              {label}（{all.filter(fn).length}）
            </Link>
          );
        })}
      </div>

      <form className="flex flex-wrap items-center gap-2">
        {sp.f && <input type="hidden" name="f" value={sp.f} />}
        <input name="q" defaultValue={sp.q} placeholder="企業名・業態・ブランドを検索" className={`${sel} w-56`} />
        {areas.length > 0 && (
          <select name="area" defaultValue={sp.area ?? ""} className={sel}>
            <option value="">すべての地域</option>
            {areas.map((x) => <option key={x}>{x}</option>)}
          </select>
        )}
        {types.length > 0 && (
          <select name="type" defaultValue={sp.type ?? ""} className={sel}>
            <option value="">すべての業態</option>
            {types.map((x) => <option key={x}>{x}</option>)}
          </select>
        )}
        <select name="rank" defaultValue={sp.rank ?? ""} className={sel}>
          <option value="">すべてのランク</option>
          {["A", "B", "C"].map((x) => <option key={x} value={x}>{x}ランク</option>)}
        </select>
        <button className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-700">絞り込む</button>
        <div className="ml-auto flex gap-2">
          <Link href={`/leads?biz=${id}#new`} className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">＋営業先を追加</Link>
          <a href={`/api/leads-csv?biz=${id}`} className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">CSV書出</a>
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">該当する候補がありません。</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 text-left text-[11px] font-bold tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">企業</th>
                  <th className="px-3 py-3">ブランド</th>
                  <th className="px-3 py-3">提案角度・メモ</th>
                  <th className="px-3 py-3">スコア</th>
                  <th className="px-5 py-3">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((l) => (
                  <tr key={l.id} className="align-top transition hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <Link href={`/leads/${l.id}`} className="font-bold text-slate-900 hover:underline">{l.company}</Link>
                      <div className="text-xs text-slate-500">{[l.meta.city ?? l.meta.area, l.meta.type].filter(Boolean).join(" / ") || l.contactName}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {l.email && <Chip>メール</Chip>}
                        {l.phone && <Chip>電話</Chip>}
                        {l.lineId && <Chip>LINE</Chip>}
                        {l.meta.sourceUrl && <Chip>Web</Chip>}
                        {!l.email && !l.phone && !l.lineId && <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-600">連絡先未登録</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-700">{l.meta.brand ?? "—"}</td>
                    <td className="max-w-[260px] px-3 py-3 text-xs text-slate-600">{l.notes || "—"}</td>
                    <td className="px-3 py-3">{l.meta.score ? <><b className="text-slate-900">{l.meta.score}</b><div className="text-xs text-slate-500">{l.meta.rank}ランク</div></> : "—"}</td>
                    <td className="px-5 py-3">
                      <StageBadge stage={l.stage} />
                      <div className="mt-1 text-xs text-slate-500">{STATUS_LABEL[l.status]}</div>
                      {l.meta.verified === "no" && <div className="mt-1 text-[10px] font-bold text-amber-700">要公式確認</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">{children}</span>;
}
