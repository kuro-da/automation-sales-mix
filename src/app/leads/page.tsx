import Link from "next/link";
import { BUSINESSES } from "@/lib/businesses";
import { listLeads } from "@/lib/crm";
import { BizBadge, PageHeader, StageBadge, STATUS_LABEL } from "@/components/badges";
import { addLeadAction } from "../actions";

export const dynamic = "force-dynamic";

const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ biz?: string }> }) {
  const { biz } = await searchParams;
  const leads = listLeads({ businessId: biz });

  return (
    <div className="space-y-6">
      <PageHeader title="リード" desc="全事業のリードを一覧で管理。登録すると Stage A の初回ドラフトが自動で作られます。" />

      <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
        <Link href="/leads" className={`rounded-full px-3.5 py-1.5 ${!biz ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
          すべて
        </Link>
        {BUSINESSES.map((b) => (
          <Link
            key={b.id}
            href={`/leads?biz=${b.id}`}
            className={`rounded-full px-3.5 py-1.5 ${biz === b.id ? "text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}
            style={biz === b.id ? { backgroundColor: b.hex } : undefined}
          >
            {b.short}
          </Link>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {leads.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">該当するリードがありません。</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">事業</th>
                <th className="px-3 py-3">会社／店名</th>
                <th className="hidden px-3 py-3 sm:table-cell">担当</th>
                <th className="hidden px-3 py-3 md:table-cell">流入元</th>
                <th className="px-3 py-3">状態</th>
                <th className="px-5 py-3">ステージ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leads.map((l) => (
                <tr key={l.id} className="transition hover:bg-brand-50/40">
                  <td className="px-5 py-3"><BizBadge id={l.businessId} /></td>
                  <td className="px-3 py-3"><Link href={`/leads/${l.id}`} className="font-bold text-slate-900 hover:text-brand-700">{l.company}</Link></td>
                  <td className="hidden px-3 py-3 text-slate-600 sm:table-cell">{l.contactName}</td>
                  <td className="hidden px-3 py-3 text-slate-500 md:table-cell">{l.source}</td>
                  <td className="px-3 py-3 text-xs text-slate-600">{STATUS_LABEL[l.status]}</td>
                  <td className="px-5 py-3"><StageBadge stage={l.stage} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section id="new" className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-slate-800">＋ リード登録</h2>
        <form action={addLeadAction} className="grid gap-3 sm:grid-cols-3">
          <select name="businessId" defaultValue={biz ?? BUSINESSES[0].id} className={input}>
            {BUSINESSES.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
          <input name="company" required placeholder="会社名／店名／お名前 *" className={input} />
          <input name="contactName" placeholder="担当者名" className={input} />
          <input name="email" type="email" placeholder="メール" className={input} />
          <input name="phone" placeholder="電話" className={input} />
          <input name="lineId" placeholder="LINE ID" className={input} />
          <input name="source" placeholder="流入元（展示会・紹介など）" className={input} />
          <input name="notes" placeholder="メモ" className={`${input} sm:col-span-2`} />
          <button className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-brand-700 sm:col-span-3 sm:justify-self-start sm:px-8">登録して Stage A を開始</button>
        </form>
      </section>
    </div>
  );
}
