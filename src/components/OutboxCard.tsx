import Link from "next/link";
import { CHANNEL_LABEL, getBusiness } from "@/lib/businesses";
import type { Lead, OutboxItem } from "@/lib/crm";
import { hasApiKey } from "@/lib/anthropic";
import { aiRewriteAction, outboxStatusAction, saveOutboxAction, sendEmailAction } from "@/app/actions";
import { BizBadge } from "./badges";

const STATUS_JA: Record<string, string> = { draft: "承認待ち", approved: "承認済み", sent: "送信済み", skipped: "取り下げ" };
const STATUS_CLS: Record<string, string> = {
  draft: "bg-amber-100 text-amber-800",
  approved: "bg-sky-100 text-sky-800",
  sent: "bg-emerald-100 text-emerald-800",
  skipped: "bg-slate-100 text-slate-500",
};

export function OutboxCard({ item, lead, showLead, back = "/outbox" }: { item: OutboxItem; lead?: Lead; showLead?: boolean; back?: string }) {
  const offer = item.offerBusinessId ? getBusiness(item.offerBusinessId) : null;
  const editable = item.status === "draft" || item.status === "approved";
  const ai = hasApiKey();

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {lead && <BizBadge id={lead.businessId} />}
        <span className="font-mono text-slate-500">{item.stepKey}</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">{CHANNEL_LABEL[item.channel]}</span>
        {offer && <span className="rounded bg-fuchsia-50 px-1.5 py-0.5 text-fuchsia-700">提案: {offer.hook}</span>}
        <span className={`rounded px-1.5 py-0.5 font-semibold ${STATUS_CLS[item.status]}`}>{STATUS_JA[item.status]}</span>
        <span className="ml-auto text-slate-400">予定 {item.dueAt.slice(0, 10)}</span>
      </div>
      {showLead && lead && (
        <Link href={`/leads/${lead.id}`} className="mt-2 block text-sm font-semibold text-brand-700 hover:underline">
          {lead.company} {lead.contactName}
        </Link>
      )}

      {editable ? (
        <form action={saveOutboxAction} className="mt-2 space-y-2">
          <input type="hidden" name="id" value={item.id} />
          <input name="subject" defaultValue={item.subject} className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium" />
          <textarea name="body" defaultValue={item.body} rows={Math.min(14, item.body.split("\n").length + 1)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed" />
          <button className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 hover:bg-slate-50">文面を保存</button>
        </form>
      ) : (
        <div className="mt-2 text-sm">
          <div className="font-medium text-slate-800">{item.subject}</div>
          <pre className="mt-1 whitespace-pre-wrap font-sans leading-relaxed text-slate-600">{item.body}</pre>
        </div>
      )}

      {item.channel === "line" && (
        <div className="mt-3 rounded-xl bg-[#7494c0]/20 p-3">
          <div className="mb-1 text-[10px] font-semibold text-slate-500">LINE プレビュー</div>
          <div className="max-w-sm rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-[13px] leading-relaxed text-slate-800 shadow-sm">
            <pre className="whitespace-pre-wrap font-sans">{item.body}</pre>
          </div>
        </div>
      )}

      {editable && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {item.status === "draft" && <Act id={item.id} status="approved" label="承認" primary />}
          {item.status === "approved" && item.channel === "email" && (
            <form action={sendEmailAction}>
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="back" value={back} />
              <button className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700">✉ 自社メールで送信</button>
            </form>
          )}
          <Act id={item.id} status="sent" label={item.channel === "call" ? "架電した（記録）" : "送信した（記録）"} />
          <Act id={item.id} status="skipped" label="取り下げ" />
          {ai && (
            <form action={aiRewriteAction} className="ml-auto">
              <input type="hidden" name="id" value={item.id} />
              <button className="rounded-md bg-slate-800 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-700">AIで清書</button>
            </form>
          )}
        </div>
      )}
    </article>
  );
}

function Act({ id, status, label, primary }: { id: string; status: string; label: string; primary?: boolean }) {
  return (
    <form action={outboxStatusAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`rounded-md px-3 py-1 text-xs font-semibold ${primary ? "bg-brand-600 text-white hover:bg-brand-700" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
        {label}
      </button>
    </form>
  );
}
