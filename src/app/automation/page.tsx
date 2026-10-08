import { BUSINESSES } from "@/lib/businesses";
import { SEQUENCE, type Stage } from "@/lib/sequences";
import { PageHeader } from "@/components/badges";
import { runTickAction } from "../actions";

export const dynamic = "force-dynamic";

const META: Record<Stage, { title: string; color: string; goal: string; exit: string }> = {
  A: { title: "アポ獲得", color: "#38bdf8", goal: "初回配信で反応を取り、未反応なら架電でアポを確約する", exit: "アポ獲得 → B ／ 最終ご案内後も無反応なら手動で失注にして C へ" },
  B: { title: "定期フォロー", color: "#f59e0b", goal: "売り込みでなく「安心・共有」の情報で検討を前に進め、停滞は担当者へ架電アラート", exit: "成約 → 配信停止 ／ 失注 → C" },
  C: { title: "別商材アプローチ", color: "#d946ef", goal: "失注理由に関わらず、他事業のフック商材を 30〜60 日おきにローテーション提案", exit: "反応があれば他事業のリードとして登録" },
};

export default function AutomationPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="自動化フロー" desc="期日が来たステップのドラフトを生成するエンジンです。リードごとに1回で最大1件、承認前の配信は行いません。" />

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-slate-800">エンジンを実行</h2>
        <form action={runTickAction} className="flex flex-wrap items-center gap-3 text-sm">
          <label className="text-slate-600">
            時間を進めて試す（日）
            <input name="days" type="number" min={0} max={120} defaultValue={0} className="ml-2 w-20 rounded-lg border border-slate-300 px-2 py-1.5" />
          </label>
          <button className="rounded-lg bg-brand-600 px-5 py-2 font-bold text-white shadow hover:bg-brand-700">実行</button>
          <span className="text-xs text-slate-400">0日＝現在時刻。30日などを指定すると期日が到来したものとして生成（動作確認用）。毎日の自動実行は後日設定します。</span>
        </form>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {(["A", "B", "C"] as Stage[]).map((st) => {
          const m = META[st];
          return (
            <section key={st} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="px-5 py-4 text-white" style={{ backgroundColor: m.color }}>
                <div className="text-[11px] font-bold tracking-widest opacity-80">STAGE {st}</div>
                <h2 className="text-lg font-black">{m.title}</h2>
              </div>
              <div className="p-5">
                <p className="text-sm leading-relaxed text-slate-700">{m.goal}</p>
                <ol className="relative mt-4 space-y-3 border-l-2 pl-4" style={{ borderColor: `${m.color}55` }}>
                  {SEQUENCE.filter((s) => s.stage === st).map((s) => (
                    <li key={s.key} className="relative">
                      <span className="absolute -left-[23px] top-1 h-3 w-3 rounded-full ring-4 ring-white" style={{ backgroundColor: m.color }} />
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-400">{s.key}</span>
                        <span className="text-sm font-semibold text-slate-800">{s.label}</span>
                        <span className="ml-auto text-[11px] text-slate-400">+{s.dayOffset}日</span>
                      </div>
                      <div className="text-[11px] text-slate-400">{s.channel === "call" ? "架電タスク" : "主チャネル（事業ごと）"}</div>
                    </li>
                  ))}
                </ol>
                <p className="mt-4 rounded-lg bg-slate-50 p-2.5 text-[11px] leading-relaxed text-slate-500">終了条件：{m.exit}</p>
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-slate-800">Stage C のクロスセル対象（事業ごとのフック商材）</h2>
        <ul className="grid gap-2.5 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESSES.map((b) => (
            <li key={b.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
              <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: b.hex }} />
              <span>
                <span className="block text-xs text-slate-400">{b.name}</span>
                <span className="font-semibold text-slate-800">{b.hook}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">失注した事業以外のフックが C1→C2→C3 の順で提案されます（リードごとに開始位置をずらして偏りを防止）。</p>
      </section>
    </div>
  );
}
