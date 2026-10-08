import type { ScriptFeedback } from "@/lib/types";
import { ScoreRing } from "./viz";

function Bullets({
  title,
  items,
  dot,
}: {
  title: string;
  items: string[];
  dot: string;
}) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-slate-700">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((t, i) => (
          <li
            key={i}
            className="flex gap-2 text-sm leading-relaxed text-slate-600"
          >
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`}
            />
            <span>{t}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ScriptFeedbackCard({
  feedback,
}: {
  feedback: ScriptFeedback;
}) {
  return (
    <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <ScoreRing score={feedback.overallScore} label="総合スコア" />
        <p className="text-sm leading-relaxed text-slate-700">
          {feedback.summary}
        </p>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold text-slate-700">
          構成ごとの評点
        </h4>
        <ul className="space-y-3">
          {feedback.sections.map((s, i) => (
            <li key={i}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-slate-700">
                  {s.label}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {s.score} / 5
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${(s.score / 5) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                {s.comment}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Bullets
          title="活かすべき強み"
          items={feedback.strengths}
          dot="bg-green-500"
        />
        <Bullets
          title="このまま話すと危ういところ"
          items={feedback.risks}
          dot="bg-amber-500"
        />
      </div>

      <div className="rounded-lg bg-brand-50 p-4">
        <h4 className="mb-2 text-sm font-semibold text-brand-800">
          添削後のトークスクリプト
        </h4>
        <p className="chat-bubble text-sm leading-relaxed text-slate-700">
          {feedback.rewrite}
        </p>
      </div>

      <Bullets
        title="すぐ直せる小さなコツ"
        items={feedback.microTips}
        dot="bg-brand-500"
      />
    </div>
  );
}
