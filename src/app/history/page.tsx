import Link from "next/link";
import {
  getStats,
  listRoleplaySessions,
  listScriptReviews,
} from "@/lib/db";
import { DIFFICULTY_LABEL } from "@/lib/types";
import { Sparkline, scoreColor } from "@/components/viz";

export const dynamic = "force-dynamic";

function fmt(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
    d.getDate(),
  ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(
    d.getMinutes(),
  ).padStart(2, "0")}`;
}

export default function HistoryPage() {
  const stats = getStats();
  const sessions = listRoleplaySessions(100);
  const scripts = listScriptReviews(100);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-lg font-bold text-slate-900">
          振り返り・成長記録
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          ロープレ評価とスクリプト添削の履歴、スコアの推移と弱点の傾向。
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            ロープレ総合スコアの推移
          </h2>
          <div className="mt-3 overflow-x-auto">
            <Sparkline
              points={stats.scoreTrend.map((t) => t.score)}
              width={480}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
            <span>
              平均{" "}
              <strong className="text-slate-700">
                {stats.avgRoleplayScore ?? "—"}
              </strong>
            </span>
            <span>
              直近5回{" "}
              <strong className="text-slate-700">
                {stats.recentAvgRoleplayScore ?? "—"}
              </strong>
            </span>
            <span>
              評価済み{" "}
              <strong className="text-slate-700">
                {stats.evaluatedRoleplays}
              </strong>{" "}
              回
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            評価軸ごとの平均（1〜5）
          </h2>
          {stats.axisAverages.length === 0 ? (
            <p className="mt-3 text-xs text-slate-400">
              評価が蓄積されると表示されます
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {stats.axisAverages.map((a) => (
                <li key={a.key}>
                  <div className="mb-0.5 flex justify-between text-xs text-slate-600">
                    <span>{a.label}</span>
                    <span className="font-semibold">{a.avg}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-brand-500"
                      style={{ width: `${(a.avg / 5) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          ロープレ履歴（{sessions.length}）
        </h2>
        {sessions.length === 0 ? (
          <EmptyRow
            text="まだロープレの記録がありません。"
            href="/roleplay"
            cta="ロープレを始める"
          />
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/history/${s.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-slate-800">
                      {s.scenarioTitle}
                    </div>
                    <div className="text-xs text-slate-500">
                      {s.personaName} ／ 難易度 {DIFFICULTY_LABEL[s.difficulty]}{" "}
                      ／ {fmt(s.createdAt)}
                    </div>
                  </div>
                  <div
                    className="shrink-0 text-lg font-bold"
                    style={{
                      color:
                        s.overallScore == null
                          ? "#94a3b8"
                          : scoreColor(s.overallScore),
                    }}
                  >
                    {s.overallScore ?? "—"}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          スクリプト添削履歴（{scripts.length}）
        </h2>
        {scripts.length === 0 ? (
          <EmptyRow
            text="まだ添削の記録がありません。"
            href="/script-review"
            cta="スクリプトを添削する"
          />
        ) : (
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {scripts.map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium text-slate-800">
                    {s.title}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {s.feedback.summary}
                  </div>
                  <div className="text-xs text-slate-400">
                    {fmt(s.createdAt)}
                  </div>
                </div>
                <div
                  className="shrink-0 text-lg font-bold"
                  style={{ color: scoreColor(s.overallScore) }}
                >
                  {s.overallScore}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyRow({
  text,
  href,
  cta,
}: {
  text: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-sm text-slate-500">
      <span>{text}</span>
      <Link
        href={href}
        className="rounded-lg bg-brand-600 px-4 py-1.5 font-semibold text-white hover:bg-brand-700"
      >
        {cta}
      </Link>
    </div>
  );
}
