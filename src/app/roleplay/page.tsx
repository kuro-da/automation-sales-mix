"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PERSONAS } from "@/lib/personas";
import { SCENARIOS } from "@/lib/scenarios";
import { DIFFICULTY_LABEL, type Difficulty, type Evaluation } from "@/lib/types";
import { useChatStream } from "@/components/useChatStream";
import { ChatPanel } from "@/components/ChatPanel";
import { EvaluationCard } from "@/components/EvaluationCard";

type Phase = "setup" | "chat" | "done";

const DIFFICULTIES: Difficulty[] = ["easy", "normal", "hard"];

export default function RoleplayPage() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [personaId, setPersonaId] = useState(PERSONAS[0].id);
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");

  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [evalError, setEvalError] = useState<string | null>(null);

  const extraBody = useMemo(
    () => ({ personaId, scenarioId, difficulty }),
    [personaId, scenarioId, difficulty],
  );

  const { messages, send, stop, reset, streaming, error } = useChatStream({
    endpoint: "/api/roleplay/chat",
    extraBody,
  });

  const persona = PERSONAS.find((p) => p.id === personaId)!;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId)!;
  const turns = messages.filter((m) => m.role === "user").length;

  function start() {
    reset();
    setEvaluation(null);
    setSavedId(null);
    setEvalError(null);
    setPhase("chat");
  }

  function restart() {
    reset();
    setEvaluation(null);
    setSavedId(null);
    setEvalError(null);
    setPhase("setup");
  }

  async function runEvaluation() {
    setEvaluating(true);
    setEvalError(null);
    try {
      const res = await fetch("/api/roleplay/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, personaId, scenarioId, difficulty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "評価に失敗しました");
      setEvaluation(data.evaluation as Evaluation);
      setSavedId(data.id as string | null);
      setPhase("done");
    } catch (e) {
      setEvalError((e as Error).message);
    } finally {
      setEvaluating(false);
    }
  }

  /* ------------------------------- 設定画面 ------------------------------- */
  if (phase === "setup") {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-xl font-bold text-slate-900">ロープレ設定</h1>
          <p className="mt-1 text-sm text-slate-600">
            顧客タイプ・場面・難易度を選んで開始します。あなたは営業役、AIが顧客役です。
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            1. 顧客タイプ
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {PERSONAS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersonaId(p.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  personaId === p.id
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-semibold text-slate-900">{p.name}</div>
                <div className="text-xs text-slate-500">{p.role}</div>
                <p className="mt-2 text-xs leading-relaxed text-slate-600">
                  {p.profile}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">2. 場面</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setScenarioId(s.id)}
                className={`rounded-xl border p-4 text-left transition ${
                  scenarioId === s.id
                    ? "border-brand-500 bg-brand-50 ring-1 ring-brand-200"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <div className="font-semibold text-slate-900">{s.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  ゴール：{s.goal}
                </p>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            3. 難易度
          </h2>
          <div className="flex gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                  difficulty === d
                    ? "border-brand-500 bg-brand-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {DIFFICULTY_LABEL[d]}
              </button>
            ))}
          </div>
        </section>

        <div className="rounded-lg bg-slate-100 p-4 text-xs leading-relaxed text-slate-600">
          <strong className="text-slate-700">選択中：</strong> {persona.name}（
          {persona.role}）／ {scenario.title} ／ 難易度{" "}
          {DIFFICULTY_LABEL[difficulty]}
        </div>

        <button
          type="button"
          onClick={start}
          className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          この設定でロープレを開始
        </button>
      </div>
    );
  }

  /* --------------------------- チャット / 結果画面 --------------------------- */
  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            {scenario.title}
          </h1>
          <p className="text-xs text-slate-500">
            顧客：{persona.name}（{persona.role}）／ 難易度{" "}
            {DIFFICULTY_LABEL[difficulty]} ／ あなたの発話 {turns} 回
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={restart}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            設定に戻る
          </button>
          {phase === "chat" && (
            <button
              type="button"
              onClick={runEvaluation}
              disabled={turns < 2 || streaming || evaluating}
              className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {evaluating ? "評価中…" : "ロープレを終えて評価する"}
            </button>
          )}
        </div>
      </header>

      <div className="rounded-lg bg-brand-50 p-3 text-xs leading-relaxed text-brand-900">
        <strong>あなたのゴール：</strong>
        {scenario.goal}
      </div>

      <ChatPanel
        messages={messages}
        streaming={streaming}
        onSend={send}
        onStop={stop}
        disabled={phase === "done" || evaluating}
        userLabel="あなた（営業）"
        assistantLabel={`${persona.name}（顧客役）`}
        placeholder="第一声から入力してください。例：お世話になります、◯◯社の△△と申します。"
        emptyState={
          <div>
            <p>あなたの第一声から始まります。</p>
            <p className="mt-1">
              名乗り → 用件 → 相手のメリット、の順を意識してみましょう。
            </p>
          </div>
        }
      />

      {error && (
        <p className="text-sm text-red-600">通信エラー：{error}</p>
      )}
      {evalError && (
        <p className="text-sm text-red-600">評価エラー：{evalError}</p>
      )}

      {phase === "done" && evaluation && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">評価結果</h2>
            <div className="flex gap-2">
              {savedId && (
                <Link
                  href={`/history/${savedId}`}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  記録ページで見る
                </Link>
              )}
              <button
                type="button"
                onClick={restart}
                className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                もう一度ロープレする
              </button>
            </div>
          </div>
          <EvaluationCard evaluation={evaluation} />
        </div>
      )}
    </div>
  );
}
