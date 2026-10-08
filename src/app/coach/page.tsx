import Link from "next/link";
import { getStats } from "@/lib/db";
import { hasApiKey } from "@/lib/anthropic";
import { Sparkline } from "@/components/viz";

export const dynamic = "force-dynamic";

const FEATURES = [
  {
    href: "/roleplay",
    title: "ロープレ",
    body: "AIが顧客役。総務・経理・情シス・社長・受付など6タイプ × 6シーン × 難易度3段階。終了後に6軸評価と改善トーク例。",
    cta: "ロープレを始める",
  },
  {
    href: "/consult",
    title: "営業相談（壁打ち）",
    body: "「間に合ってますで切られる」「リースがあると言われる」など、突破できない場面を相談。その場で使える切り返しを提案。",
    cta: "相談する",
  },
  {
    href: "/script-review",
    title: "トークスクリプト添削",
    body: "自分のトーク台本や実際に話した内容を貼り付け。構成ごとの評点・切られるリスク・添削後スクリプトを返します。",
    cta: "添削してもらう",
  },
  {
    href: "/history",
    title: "振り返り・成長記録",
    body: "過去のロープレ評価とスコア推移、弱点の傾向を蓄積。伸びている軸・停滞している軸が見えます。",
    cta: "記録を見る",
  },
];

export default function HomePage() {
  const stats = getStats();
  const apiKeyReady = hasApiKey();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">
          代理販売店 営業コーチAI
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          トナーカートリッジ・フック商材・オフィス機器の電話／訪問営業に特化した、
          ひとりで回せるコーチング環境です。ロープレで場数を踏み、詰まった場面は壁打ちで崩し、
          台本は添削で磨き、結果は記録で振り返ります。
        </p>
      </section>

      {!apiKeyReady && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <strong className="font-semibold">セットアップが未完了です。</strong>{" "}
          プロジェクト直下の <code className="rounded bg-amber-100 px-1">.env.local</code> に{" "}
          <code className="rounded bg-amber-100 px-1">ANTHROPIC_API_KEY</code>{" "}
          を設定し、開発サーバーを再起動してください。設定するまでAIの応答は動作しません。
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="ロープレ実施回数"
          value={String(stats.totalRoleplays)}
          sub={`うち評価済み ${stats.evaluatedRoleplays} 回`}
        />
        <StatCard
          label="平均総合スコア"
          value={stats.avgRoleplayScore == null ? "—" : String(stats.avgRoleplayScore)}
          sub={
            stats.recentAvgRoleplayScore == null
              ? "まだ評価がありません"
              : `直近5回の平均 ${stats.recentAvgRoleplayScore}`
          }
        />
        <StatCard
          label="スクリプト添削"
          value={String(stats.totalScriptReviews)}
          sub="回"
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">スコア推移</h2>
        <div className="mt-3 overflow-x-auto">
          <Sparkline points={stats.scoreTrend.map((t) => t.score)} width={560} />
        </div>
        {stats.axisAverages.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {stats.axisAverages.map((a) => (
              <span
                key={a.key}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
              >
                {a.label}：平均 {a.avg} / 5
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
          >
            <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              {f.body}
            </p>
            <span className="mt-3 inline-block text-sm font-semibold text-brand-600 group-hover:underline">
              {f.cta} →
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
      <div className="mt-0.5 text-xs text-slate-400">{sub}</div>
    </div>
  );
}
