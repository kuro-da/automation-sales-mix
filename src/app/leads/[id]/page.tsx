import Link from "next/link";
import { notFound } from "next/navigation";
import { getBusiness } from "@/lib/businesses";
import { getLead, listActivities, listOutbox } from "@/lib/crm";
import { BizBadge, StageBadge, STATUS_LABEL } from "@/components/badges";
import { OutboxCard } from "@/components/OutboxCard";
import { Flash } from "@/components/Flash";
import { saveNotesAction, setStatusAction, unsubscribeAction } from "../../actions";

export const dynamic = "force-dynamic";

const STEPS = [
  { key: "A", label: "アポ獲得", color: "#38bdf8" },
  { key: "B", label: "定期フォロー", color: "#f59e0b" },
  { key: "C", label: "別商材提案", color: "#d946ef" },
];

export default async function LeadPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { id } = await params;
  const { msg } = await searchParams;
  const lead = getLead(id);
  if (!lead) notFound();
  const biz = getBusiness(lead.businessId);
  const items = listOutbox({ leadId: id });
  const acts = listActivities(id);
  const closed = lead.status === "won";
  const order = ["A", "B", "C"];
  const cur = order.indexOf(lead.stage);

  return (
    <div className="space-y-6">
      <Flash msg={msg} />
      {lead.unsubscribed && <Flash msg="このリードは配信停止です。自動配信・メール送信の対象外になっています。" ok={false} />}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Link href="/leads" className="text-xs text-slate-500 hover:underline">← リード一覧</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black text-slate-900">{lead.company}</h1>
          <BizBadge id={lead.businessId} />
          <StageBadge stage={lead.stage} />
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">{STATUS_LABEL[lead.status]}</span>
        </div>
        <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
          {[
            ["担当", lead.contactName],
            ["メール", lead.email],
            ["電話", lead.phone],
            ["LINE", lead.lineId],
            ["流入元", lead.source],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="flex gap-1.5">
                <dt className="text-slate-400">{k}</dt>
                <dd className="font-medium text-slate-800">{v}</dd>
              </div>
            ))}
        </dl>

        {/* ステージ進行 */}
        <ol className="mt-5 grid grid-cols-3 gap-2">
          {STEPS.map((s, i) => {
            const state = closed ? "done" : i < cur ? "done" : i === cur ? "now" : "next";
            return (
              <li key={s.key} className="rounded-xl border px-3 py-2.5" style={{ borderColor: state === "next" ? "#e2e8f0" : `${s.color}88`, backgroundColor: state === "now" ? `${s.color}1f` : state === "done" ? `${s.color}0d` : "white", opacity: state === "next" ? 0.55 : 1 }}>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <span className="grid h-5 w-5 place-items-center rounded-md text-[11px] text-white" style={{ backgroundColor: s.color }}>{state === "done" ? "✓" : s.key}</span>
                  {s.label}
                </div>
                {state === "now" && <div className="mt-1 text-[11px] text-slate-500">現在のステージ</div>}
              </li>
            );
          })}
        </ol>
      </section>

      {lead.meta.sourceUrl !== undefined && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-bold text-slate-800">調査メモ</h2>
            {lead.meta.verified === "no" && <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">公式確認前：実在・連絡先を確認してから連絡</span>}
            {lead.meta.rank && <span className="rounded bg-slate-900 px-2 py-0.5 text-[11px] font-black text-white">RANK {lead.meta.rank}／スコア {lead.meta.score}</span>}
          </div>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {[["エリア", lead.meta.area], ["業態", lead.meta.type], ["使用ブランド", lead.meta.brand], ["連絡導線", lead.meta.contactRoute], ["根拠", lead.meta.evidence]].map(([k, v]) => v ? (
              <div key={String(k)} className="flex gap-2"><dt className="w-24 shrink-0 text-slate-400">{k}</dt><dd className="text-slate-800">{v}</dd></div>
            ) : null)}
          </dl>
          {lead.meta.sourceUrl && <a href={String(lead.meta.sourceUrl)} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs font-semibold text-brand-600 hover:underline">根拠URLを開く ↗</a>}
        </section>
      )}

      {!closed && (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">結果を記録（フローのステージが切り替わります）</h2>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBtn id={id} status="appointed" label={`${biz?.cta.split("（")[0] ?? "アポ"}を獲得 → B`} cls="bg-sky-600 text-white hover:bg-sky-700" />
            <StatusBtn id={id} status="negotiating" label="商談中" />
            <StatusBtn id={id} status="won" label="成約（配信停止）" cls="bg-emerald-600 text-white hover:bg-emerald-700" />
            <form action={setStatusAction} className="ml-auto flex items-center gap-2">
              <input type="hidden" name="leadId" value={id} />
              <input type="hidden" name="status" value="lost" />
              <input name="lostReason" placeholder="失注理由（例: 価格・時期）" className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs" />
              <button className="rounded-lg border border-rose-300 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50">失注 → C</button>
            </form>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-slate-800">配信ドラフト・履歴（{items.length}）</h2>
        {items.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">まだありません。「自動化フロー」で実行すると、期日が来たものから生成されます。</p>
        ) : (
          items.map((it) => <OutboxCard key={it.id} item={it} lead={lead} back={`/leads/${id}`} />)
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-2 text-sm font-bold text-slate-800">メモ</h2>
          <form action={saveNotesAction} className="space-y-2">
            <input type="hidden" name="leadId" value={id} />
            <textarea name="notes" defaultValue={lead.notes} rows={5} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50">保存</button>
          </form>
          <form action={unsubscribeAction} className="mt-3 border-t border-slate-100 pt-3">
            <input type="hidden" name="leadId" value={id} />
            <input type="hidden" name="value" value={lead.unsubscribed ? "0" : "1"} />
            <button className="text-xs font-semibold text-slate-500 underline hover:text-rose-600">{lead.unsubscribed ? "配信停止を解除" : "配信停止にする（相手から停止の連絡があった場合）"}</button>
          </form>
          {lead.lostReason && <p className="mt-2 text-xs font-medium text-rose-600">失注理由: {lead.lostReason}</p>}
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-bold text-slate-800">活動履歴</h2>
          <ul className="relative space-y-3 border-l border-slate-200 pl-4 text-sm">
            {acts.map((a) => (
              <li key={a.id} className="relative">
                <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-brand-500 ring-4 ring-white" />
                <div className="text-[11px] text-slate-400">{a.createdAt.slice(0, 10)}</div>
                <div className="text-slate-700">{a.text}</div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatusBtn({ id, status, label, cls }: { id: string; status: string; label: string; cls?: string }) {
  return (
    <form action={setStatusAction}>
      <input type="hidden" name="leadId" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`rounded-lg px-3.5 py-1.5 text-xs font-bold ${cls ?? "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>{label}</button>
    </form>
  );
}
