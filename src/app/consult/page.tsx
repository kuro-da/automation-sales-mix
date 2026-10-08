"use client";

import { useChatStream } from "@/components/useChatStream";
import { ChatPanel } from "@/components/ChatPanel";
import type { ChatMessage } from "@/lib/types";

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "営業相談の壁打ち相手です。トナー・オフィス機器の電話／訪問営業で、いま突破できていない場面を教えてください。\n「どのお客さんの」「どの場面で」「相手に何と言われて」「自分は何と返したか」まで書いてもらえると、具体的な切り返しを一緒に組み立てられます。",
};

const CHIPS = [
  "受付で『担当は不在』と言われ、いつ掛けても取り次いでもらえません。",
  "『トナーは間に合ってます』と即答されて会話が続きません。",
  "『複合機のリース契約があるから』と言われた時の切り返しが弱いです。",
  "提案は好感触なのに、最後は毎回『社内で検討します』で止まります。",
  "既存のトナー客に複合機やシュレッダーを提案したいが、話の広げ方が分かりません。",
];

export default function ConsultPage() {
  const { messages, send, stop, reset, streaming, error } = useChatStream({
    endpoint: "/api/consult",
    initialMessages: [GREETING],
  });

  const started = messages.some((m) => m.role === "user");

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            営業相談（壁打ち）
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            突破できない場面を相談。その場で使える言い回し・順番・切り返しを返します。
          </p>
        </div>
        <button
          type="button"
          onClick={() => reset([GREETING])}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          相談をリセット
        </button>
      </header>

      {!started && (
        <div className="flex flex-wrap gap-2">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => send(c)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-left text-xs text-slate-600 hover:border-brand-300 hover:bg-brand-50"
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <ChatPanel
        messages={messages}
        streaming={streaming}
        onSend={send}
        onStop={stop}
        userLabel="あなた"
        assistantLabel="AIコーチ"
        placeholder="相談内容を入力（具体的なやり取りを書くほど精度が上がります）"
        heightClass="h-[58vh]"
      />

      {error && <p className="text-sm text-red-600">通信エラー：{error}</p>}
    </div>
  );
}
