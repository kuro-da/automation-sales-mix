"use client";

import { useState } from "react";
import Link from "next/link";
import type { ScriptFeedback } from "@/lib/types";
import { ScriptFeedbackCard } from "@/components/ScriptFeedbackCard";

const SAMPLE = `お世話になります。オフィスサポートの山田と申します。
本日は御社でお使いのトナーについてご案内のお電話です。
弊社、純正互換のトナーを扱っておりまして、品質はそのままで価格を抑えられます。
一度お見積もりだけでもいかがでしょうか。`;

export default function ScriptReviewPage() {
  const [title, setTitle] = useState("新規テレアポの冒頭トーク");
  const [context, setContext] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ScriptFeedback | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function submit() {
    if (scriptText.trim().length < 15) {
      setError("添削対象のスクリプトを入力してください。");
      return;
    }
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch("/api/script-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, context, scriptText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "添削に失敗しました");
      setFeedback(data.feedback as ScriptFeedback);
      setSavedId(data.id as string | null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-lg font-bold text-slate-900">
          トークスクリプト添削
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          台本、または実際に話した内容を貼り付けてください。構成ごとの評点と添削後スクリプトを返します。
        </p>
      </header>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            用途・場面
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="例：既存客への複合機アップセルの切り出し"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            補足（任意）
          </label>
          <input
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="例：相手は多忙な総務担当。過去に一度断られている。"
          />
        </div>
        <div>
          <div className="mb-1 flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700">
              トークスクリプト
            </label>
            <button
              type="button"
              onClick={() => setScriptText(SAMPLE)}
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              サンプルを入れる
            </button>
          </div>
          <textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            rows={10}
            className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2 text-sm leading-relaxed outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            placeholder="ここにトーク台本を貼り付け"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:bg-slate-300"
          >
            {loading ? "添削中…" : "添削してもらう"}
          </button>
          {error && <span className="text-sm text-red-600">{error}</span>}
        </div>
      </div>

      {feedback && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">添削結果</h2>
            {savedId && (
              <Link
                href="/history"
                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                記録一覧へ
              </Link>
            )}
          </div>
          <ScriptFeedbackCard feedback={feedback} />
        </div>
      )}
    </div>
  );
}
