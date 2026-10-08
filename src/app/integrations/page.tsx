import { PageHeader } from "@/components/badges";
import { Flash } from "@/components/Flash";
import { getMailConfig, missingConfig } from "@/lib/mailer";
import { countSentToday } from "@/lib/crm";
import { verifySmtpAction } from "../actions";

export const dynamic = "force-dynamic";

const MODE_LABEL = {
  dry: { t: "ドライラン", d: "送信せず記録だけ。画面の流れの確認用", cls: "bg-slate-100 text-slate-600" },
  test: { t: "テスト送信", d: "宛先を MAIL_TEST_TO に差し替えて送る", cls: "bg-amber-100 text-amber-800" },
  live: { t: "本番送信", d: "リードのメールアドレス宛に実際に送る", cls: "bg-emerald-100 text-emerald-800" },
} as const;

const ROADMAP: { name: string; desc: string; phase: string }[] = [
  { name: "LINE公式アカウント", desc: "友だちへの個別・一斉メッセージ。リードとのID紐づけ", phase: "次" },
  { name: "X（旧Twitter）自動投稿", desc: "事業ごとの投稿カレンダー、AIで下書き→承認→予約投稿", phase: "次" },
  { name: "Instagram / Facebook / Googleビジネスプロフィール", desc: "飲食・スポーツ・精肉の集客投稿、口コミ返信の下書き", phase: "検討" },
  { name: "フォーム・問い合わせ取込", desc: "HPや広告のフォームからリードを自動登録 → Stage A 開始", phase: "検討" },
  { name: "返信の自動検知", desc: "メール返信を検知してステージを自動で進める／配信停止を自動記録", phase: "検討" },
  { name: "カレンダー連携・アポ確定", desc: "候補日の提示、予約リンク、リマインド配信", phase: "検討" },
  { name: "AIテレアポ・架電連携", desc: "未反応者への架電を自動化し、結果をリードに記録", phase: "検討" },
  { name: "請求・入金・成約後のフォロー", desc: "成約後の継続フォロー（Stage D）とアップセル", phase: "検討" },
];

export default async function IntegrationsPage({ searchParams }: { searchParams: Promise<{ msg?: string; ok?: string }> }) {
  const { msg, ok } = await searchParams;
  const c = getMailConfig();
  const miss = missingConfig(c);
  const mode = MODE_LABEL[c.mode];
  const configured = miss.length === 0;
  const checks: [string, boolean][] = [
    ["SMTP_HOST（SMTPサーバー）", !!c.host],
    ["SMTP_USER / SMTP_PASS", !!c.user && !!c.pass],
    ["MAIL_FROM（送信元アドレス）", !!c.from],
    ["MAIL_FOOTER（会社名・住所・連絡先）", c.footer.length > 0],
    ...(c.mode === "test" ? ([["MAIL_TEST_TO（テスト宛先）", !!c.testTo]] as [string, boolean][]) : []),
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="連携設定" desc="まずは自社メールで始めます。設定は .env.local に書き、パスワードはこの画面には表示されません。" />
      <Flash msg={msg} ok={ok !== "0"} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-black text-slate-900">✉ 自社メール（SMTP）</h2>
          <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${configured ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-700"}`}>
            {configured ? "設定済み" : "未設定あり"}
          </span>
          <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${mode.cls}`}>モード：{mode.t}</span>
          <span className="ml-auto text-xs text-slate-400">本日の送信 {countSentToday("email")} / 上限 {c.dailyLimit} 通</span>
        </div>
        <p className="mt-2 text-sm text-slate-600">{mode.d}。承認済みのメールだけが送信でき、配信停止のリードと1日の上限は自動で除外されます。</p>

        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {checks.map(([k, v]) => (
            <li key={k} className="flex items-center gap-2">
              <span className={`grid h-5 w-5 place-items-center rounded-full text-[11px] font-bold ${v ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"}`}>{v ? "✓" : "–"}</span>
              <span className={v ? "text-slate-800" : "text-slate-500"}>{k}</span>
            </li>
          ))}
        </ul>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <form action={verifySmtpAction}>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700">SMTP接続テスト</button>
          </form>
          <span className="text-xs text-slate-400">接続の確認のみ（メールは送りません）</span>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-600">
          <div className="font-bold text-slate-700">設定の手順</div>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4">
            <li>プロジェクト直下の <code className="rounded bg-white px-1">.env.example</code> の「自社メール送信」ブロックを <code className="rounded bg-white px-1">.env.local</code> にコピーして値を入力</li>
            <li>開発サーバーを再起動 →「SMTP接続テスト」</li>
            <li><code className="rounded bg-white px-1">MAIL_MODE=test</code> にして自分宛にテスト送信 → 問題なければ <code className="rounded bg-white px-1">live</code></li>
          </ol>
          <p className="mt-2 text-slate-400">営業メールには、送信者の名称・住所と配信停止の方法を表示する必要があります（本文末尾に自動で付与）。MAIL_FOOTER に正式な会社情報を入れてください。</p>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-slate-800">営業自動化ロードマップ</h2>
        <p className="mb-4 text-xs text-slate-500">メールの次に、SNS・LINEなど営業に関わる自動化を順に追加していきます。</p>
        <ul className="divide-y divide-slate-100">
          {ROADMAP.map((r) => (
            <li key={r.name} className="flex items-start gap-3 py-3">
              <span className={`mt-0.5 shrink-0 rounded-md px-2 py-0.5 text-[11px] font-bold ${r.phase === "次" ? "bg-brand-100 text-brand-700" : "bg-slate-100 text-slate-500"}`}>{r.phase}</span>
              <div>
                <div className="text-sm font-semibold text-slate-800">{r.name}</div>
                <div className="text-xs text-slate-500">{r.desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
