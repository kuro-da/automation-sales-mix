import Link from "next/link";
import { notFound } from "next/navigation";
import { CHANNEL_LABEL, getBusiness } from "@/lib/businesses";
import { listLeads, listOutbox } from "@/lib/crm";

export const dynamic = "force-dynamic";

interface Task {
  kind: string;
  color: string;
  company: string;
  desc: string;
  href: string;
}

export default async function WorldTasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = getBusiness(id);
  if (!b) notFound();
  const leads = listLeads({ businessId: id });
  const byId = new Map(leads.map((l) => [l.id, l]));
  const drafts = listOutbox({ status: "draft" }).filter((o) => byId.has(o.leadId));
  const approved = listOutbox({ status: "approved" }).filter((o) => byId.has(o.leadId));
  const missing = leads.filter((l) => !l.email && !l.phone && !l.lineId && l.stage !== "done");
  const stalled = leads.filter((l) => l.stage === "B" && Date.now() - new Date(l.stageEnteredAt).getTime() > 14 * 86_400_000);

  const tasks: Task[] = [
    ...drafts.map((o) => ({ kind: "送信前確認", color: "#f59e0b", company: byId.get(o.leadId)!.company, desc: `${o.stepKey}（${CHANNEL_LABEL[o.channel]}）の文面を確認して承認`, href: "/outbox" })),
    ...approved.map((o) => ({ kind: "送信待ち", color: "#2563eb", company: byId.get(o.leadId)!.company, desc: `${o.stepKey}（${CHANNEL_LABEL[o.channel]}）は承認済み。送信して記録`, href: "/outbox?s=approved" })),
    ...stalled.map((l) => ({ kind: "停滞フォロー", color: "#d946ef", company: l.company, desc: "検討開始から2週間以上動きなし。担当者から架電", href: `/leads/${l.id}` })),
    ...missing.map((l) => ({ kind: "連絡先登録", color: "#e11d48", company: l.company, desc: "メール・電話・LINEのいずれかを登録", href: `/leads/${l.id}` })),
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-black tracking-widest text-slate-400">TASK CENTER</div>
        <h1 className="text-xl font-black text-slate-900">営業タスク</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Kpi n={drafts.length} label="確認待ち" />
        <Kpi n={missing.length} label="連絡先未登録" />
        <Kpi n={stalled.length} label="停滞フォロー" />
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {tasks.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">いまやるべきタスクはありません 🎉</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tasks.map((t, i) => (
              <li key={i}>
                <Link href={t.href} className="flex flex-wrap items-center gap-3 px-5 py-3 text-sm hover:bg-slate-50">
                  <span className="rounded-md px-2 py-0.5 text-[11px] font-black text-white" style={{ backgroundColor: t.color }}>{t.kind}</span>
                  <span className="font-bold text-slate-900">{t.company}</span>
                  <span className="text-xs text-slate-500">{t.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Kpi({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="text-3xl font-black tabular-nums text-slate-900">{n}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}
