import Link from "next/link";
import { getLead, listOutbox, type OutboxStatus } from "@/lib/crm";
import { OutboxCard } from "@/components/OutboxCard";
import { PageHeader } from "@/components/badges";
import { Flash } from "@/components/Flash";

export const dynamic = "force-dynamic";

const TABS: [OutboxStatus, string][] = [
  ["draft", "承認待ち"],
  ["approved", "承認済み（未送信）"],
  ["sent", "送信済み"],
  ["skipped", "取り下げ"],
];

export default async function OutboxPage({ searchParams }: { searchParams: Promise<{ s?: string; msg?: string }> }) {
  const { s, msg } = await searchParams;
  const status = (TABS.find(([k]) => k === s)?.[0] ?? "draft") as OutboxStatus;
  const items = listOutbox({ status });

  return (
    <div className="space-y-5">
      <PageHeader
        title="配信キュー"
        desc="自動生成されたメール／LINE／架電タスクを確認し、承認してから送ります。メールは承認後に「自社メールで送信」で送れます（設定は「連携設定」）。LINE・架電は手動で行い「記録」を押してください。"
      />
      <Flash msg={msg} />
      <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
        {TABS.map(([k, label]) => (
          <Link key={k} href={`/outbox?s=${k}`} className={`rounded-full px-3.5 py-1.5 ${status === k ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"}`}>
            {label}
          </Link>
        ))}
      </div>
      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">該当するアイテムはありません。</p>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <OutboxCard key={it.id} item={it} lead={getLead(it.leadId) ?? undefined} showLead back={`/outbox?s=${status}`} />
          ))}
        </div>
      )}
    </div>
  );
}
