import Link from "next/link";
import { notFound } from "next/navigation";
import { getRoleplaySession } from "@/lib/db";
import { DIFFICULTY_LABEL } from "@/lib/types";
import { EvaluationCard } from "@/components/EvaluationCard";

export const dynamic = "force-dynamic";

export default async function HistoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = getRoleplaySession(id);
  if (!session) notFound();

  const created = new Date(session.createdAt).toLocaleString("ja-JP");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/history"
          className="text-sm font-medium text-brand-600 hover:underline"
        >
          ← 振り返り一覧へ
        </Link>
      </div>

      <header>
        <h1 className="text-lg font-bold text-slate-900">
          {session.scenarioTitle}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          顧客：{session.personaName} ／ 難易度{" "}
          {DIFFICULTY_LABEL[session.difficulty]} ／ {created}
        </p>
      </header>

      {session.evaluation ? (
        <EvaluationCard evaluation={session.evaluation} />
      ) : (
        <p className="rounded-lg bg-slate-100 p-4 text-sm text-slate-500">
          このセッションには評価が保存されていません。
        </p>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          会話の記録
        </h2>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          {session.transcript.map((m, i) => {
            const isUser = m.role === "user";
            return (
              <div
                key={i}
                className={`flex flex-col ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                <span className="mb-1 text-xs font-medium text-slate-400">
                  {isUser ? "あなた（営業）" : `${session.personaName}（顧客役）`}
                </span>
                <div
                  className={`chat-bubble max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    isUser
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
