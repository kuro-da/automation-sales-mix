import type { Evaluation } from "@/lib/types";
import { AxisBars, ScoreRing } from "./viz";

function List({
  title,
  items,
  tone,
}: {
  title: string;
  items: string[];
  tone: "good" | "bad" | "next";
}) {
  const dot =
    tone === "good"
      ? "bg-green-500"
      : tone === "bad"
        ? "bg-amber-500"
        : "bg-brand-500";
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-slate-700">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-600">
            <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EvaluationCard({ evaluation }: { evaluation: Evaluation }) {
  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ScoreRing score={evaluation.overallScore} label="総合スコア" />
        <p className="text-sm leading-relaxed text-slate-700">
          {evaluation.summary}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-700">
            評価軸ごとの評点
          </h4>
          <AxisBars axes={evaluation.axes} />
        </div>
        <div className="space-y-5">
          <List title="良かった点" items={evaluation.goods} tone="good" />
          <List
            title="改善点"
            items={evaluation.improvements}
            tone="bad"
          />
          <List
            title="次のロープレで意識すること"
            items={evaluation.nextActions}
            tone="next"
          />
        </div>
      </div>

      <div className="rounded-lg bg-brand-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-brand-800">
          そのまま使える改善トーク例
        </h4>
        <p className="chat-bubble text-sm leading-relaxed text-slate-700">
          {evaluation.betterTalk}
        </p>
      </div>
    </div>
  );
}
