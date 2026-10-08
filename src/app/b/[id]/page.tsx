import Link from "next/link";
import { notFound } from "next/navigation";
import { getWorld } from "@/lib/worlds";
import { getWorldStats, listBusinessActivities, listLeads, listOutbox } from "@/lib/crm";
import { buildMeeting } from "@/lib/meeting";
import { buildTeam } from "@/lib/team";
import { Flash } from "@/components/Flash";
import { OfficeFloor } from "@/components/OfficeFloor";
import { StageBadge, STATUS_LABEL } from "@/components/badges";
import { importTokotonAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function WorldOfficePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { id } = await params;
  const { msg } = await searchParams;
  const b = getWorld(id);
  if (!b) notFound();
  const t = b.theme;
  const s = getWorldStats(id);
  const leads = listLeads({ businessId: id });
  const ids = new Set(leads.map((l) => l.id));
  const items = listOutbox().filter((o) => ids.has(o.leadId));
  const acts = listBusinessActivities(id, 7);

  const a = leads.filter((l) => l.stage === "A").length;
  const bb = leads.filter((l) => l.stage === "B").length;
  const c = leads.filter((l) => l.stage === "C").length;
  const stalledB = leads.filter((l) => l.stage === "B" && Date.now() - new Date(l.stageEnteredAt).getTime() > 14 * 86_400_000).length;
  const script = buildMeeting(b, s, { a, b: bb, c, stalledB });

  const team = buildTeam(b, script.working, script.meeting);
  const dealCount = leads.filter((l) => l.stage === "B" || l.status === "won").length;
  const proposals = items.length;
  const rankA = leads.filter((l) => l.meta.rank === "A").length || leads.length;
  const pct = Math.min(100, Math.round(((Math.min(leads.length, 50) / 50 + dealCount / 10 + Math.min(proposals, 5) / 5 + Math.min(s.drafts, 5) / 5) / 4) * 100));
  const goals = [
    { label: "新規リード 50件", done: leads.length >= 50 },
    { label: "商談化 10件", done: dealCount >= 10 },
    { label: "提案書 5件", done: proposals >= 5 },
    { label: "受注 3件", done: s.won >= 3 },
  ];
  const active = leads.filter((l) => l.stage === "B" || items.some((o) => o.leadId === l.id)).slice(0, 6);

  return (
    <div className="space-y-5">
      <Flash msg={msg} />

      <OfficeFloor
        members={team}
        leadNames={leads.map((l) => l.company)}
        goals={goals}
        agenda={script.agenda}
        hud={{ rank: s.rank, level: s.level, xp: s.xp, xpNext: s.level * 40, progress: s.levelProgress, streak: s.streak, power: s.xp * 20 + s.level * 100 }}
        quest={{ name: "有望リードを増やす", prospect: [rankA, 20], deal: [dealCount, 3] }}
        logo={{ title: b.id === "meat" ? "とことん871 AI営業オフィス" : `${t.title} AI営業オフィス`, sub: "VIRTUAL SALES FLOOR" }}
        accent={t.accent}
        accent2={t.accent2}
      />

      {id === "meat" && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm">
          <span className="text-slate-600">既存の「とことん871 AI営業オフィス」から候補16件を取り込めます（公式確認前として登録）。</span>
          <form action={importTokotonAction}>
            <button className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700">候補を取り込む</button>
          </form>
          <a href="/tokoton871-office.html" target="_blank" rel="noreferrer" className="text-xs font-bold text-brand-600 hover:underline">3Dバーチャルオフィス（元のHTML）を開く ↗</a>
        </div>
      )}

      {/* 本日の進捗 / 進行中の案件 / お知らせ */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card title="本日の進捗">
          <div className="flex items-center gap-5">
            <div className="grid h-24 w-24 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(${t.accent} ${pct}%, #e2e8f0 0)` }}>
              <div className="grid h-[76px] w-[76px] place-items-center rounded-full bg-white text-xl font-black text-slate-900">{pct}%</div>
            </div>
            <dl className="flex-1 space-y-1.5 text-sm">
              {[
                ["新規リード", `${leads.length} / 50`],
                ["商談化", `${dealCount} / 10`],
                ["提案書", `${Math.min(proposals, 5)} / 5`],
                ["確認待ち", `${s.drafts}件`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-dashed border-slate-100">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-black text-slate-900">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>
        <Card title="進行中の案件">
          {active.length === 0 ? (
            <p className="text-sm text-slate-400">進行中の案件はまだありません。</p>
          ) : (
            <ul className="space-y-2">
              {active.map((l) => (
                <li key={l.id}>
                  <Link href={`/leads/${l.id}`} className="flex items-center gap-2 rounded-lg p-1.5 text-sm hover:bg-slate-50">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-slate-900">{l.company}</span>
                      <span className="block truncate text-xs text-slate-500">{l.notes || STATUS_LABEL[l.status]}</span>
                    </span>
                    <StageBadge stage={l.stage} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="お知らせ">
          {acts.length === 0 ? (
            <p className="text-sm text-slate-400">まだ活動はありません。</p>
          ) : (
            <ul className="space-y-2">
              {acts.map((x) => (
                <li key={x.id} className="text-sm">
                  <div className="font-bold text-slate-800">{x.company}</div>
                  <div className="text-xs text-slate-500">{x.text}・{x.createdAt.slice(0, 10)}</div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* AI社員名簿 */}
      <section>
        <div className="mb-3">
          <div className="text-[10px] font-black tracking-widest text-slate-400">AI ROSTER</div>
          <div className="flex items-center gap-3"><h2 className="text-sm font-bold text-slate-800">AI社員名簿</h2><Link href={`/b/${id}/characters`} className="rounded-full border border-slate-300 px-3 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50">＋ キャラクター登録</Link></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((st, i) => (
            <article key={st.key} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${t.accent}, ${t.accent2})` }} />
              <div className="flex gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={st.portrait} alt={st.name} className="h-24 w-24 shrink-0 rounded-xl bg-slate-900 object-contain" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-black text-slate-900">{st.name}</span>
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-black text-white" style={{ backgroundColor: st.rarity === "SSR" ? t.accent : "#64748b" }}>{st.rarity}</span>
                  </div>
                  <div className="text-xs text-slate-500">{st.role}</div>
                  <div className="mt-0.5 text-[11px] font-semibold" style={{ color: t.accent }}>必殺技：{st.move}</div>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-600">{st.task}</p>
              <div className="mt-2 text-[10px] font-semibold text-slate-400">担当工程：{st.stage}</div>
            </article>
          ))}
        </div>
      </section>

      <Card title="会議の結論：次のアクション">
        <ol className="space-y-2">
          {script.nextActions.map((x, i) => (
            <li key={x.text}>
              <Link href={x.href} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-slate-300 hover:bg-slate-50">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-black text-white" style={{ backgroundColor: t.accent }}>{i + 1}</span>
                <span className="min-w-0 flex-1 text-sm text-slate-800">{x.text}</span>
                <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600">担当：{x.who}</span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs text-slate-400">議題と結論は、いまのリード・ドラフトの件数から自動で作られます。実際の送信は人が承認してから行います。</p>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-slate-800">{title}</h3>
      {children}
    </section>
  );
}
