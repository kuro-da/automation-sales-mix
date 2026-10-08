import { notFound } from "next/navigation";
import { getBusiness } from "@/lib/businesses";
import { listCharacters } from "@/lib/crm";
import { buildMeeting } from "@/lib/meeting";
import { buildTeam } from "@/lib/team";
import { getWorldStats } from "@/lib/crm";
import { CharacterForm } from "@/components/CharacterForm";
import { Flash } from "@/components/Flash";
import { deleteCharacterAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function CharactersPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { id } = await params;
  const { msg } = await searchParams;
  const b = getBusiness(id);
  if (!b) notFound();
  const t = b.theme;
  const script = buildMeeting(b, getWorldStats(id), { a: 0, b: 0, c: 0, stalledB: 0 });
  const team = buildTeam(b, script.working, script.meeting);
  const chars = listCharacters(id);
  const byId = new Map(chars.map((c) => [c.id, c]));

  return (
    <div className="space-y-5">
      <Flash msg={msg} />
      <div>
        <div className="text-[10px] font-black tracking-widest text-slate-400">CHARACTERS</div>
        <h1 className="text-xl font-black text-slate-900">キャラクター登録</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-600">
          このワールドのオフィスで働くAI社員を登録できます。既存の6役の見た目・名前を置き換えることも、席を増やして追加メンバー（最大10名まで）にすることもできます。他のワールドには影響しません。
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold text-slate-800">現在のチーム（{team.length}名）</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {team.map((m) => {
            const rec = m.characterId ? byId.get(m.characterId) : undefined;
            return (
              <article key={m.key} className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.portrait} alt={m.name} className="h-24 w-24 shrink-0 rounded-xl bg-slate-900 object-contain" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-slate-900">{m.name}</span>
                      <span className="rounded px-1.5 py-0.5 text-[10px] font-black text-white" style={{ backgroundColor: m.rarity === "SSR" ? t.accent : "#64748b" }}>{m.rarity}</span>
                      {m.custom ? (
                        <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">{rec?.replaces ? "置き換え" : "追加"}</span>
                      ) : (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">標準</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{m.role}</div>
                  </div>
                </div>
                {rec && (
                  <details className="mt-3 border-t border-slate-100 pt-3">
                    <summary className="cursor-pointer text-xs font-bold text-slate-600">編集する</summary>
                    <div className="mt-3">
                      <CharacterForm businessId={id} c={rec} accent={t.accent} />
                      <form action={deleteCharacterAction} className="mt-3">
                        <input type="hidden" name="businessId" value={id} />
                        <input type="hidden" name="id" value={rec.id} />
                        <button className="text-xs font-bold text-rose-600 underline hover:text-rose-700">この登録を解除する</button>
                      </form>
                    </div>
                  </details>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-sm font-bold text-slate-800">＋ 新しいキャラクターを登録</h2>
        <CharacterForm businessId={id} accent={t.accent} />
      </section>
    </div>
  );
}
