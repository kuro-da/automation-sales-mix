import Link from "next/link";
import { notFound } from "next/navigation";
import { CHANNEL_LABEL } from "@/lib/businesses";
import { getWorld } from "@/lib/worlds";
import { SEQUENCE } from "@/lib/sequences";
import { listWorldArtVersions } from "@/lib/crm";
import { Flash } from "@/components/Flash";
import { clearWorldArtAction, clearWorldNameAction, saveWorldArtAction, saveWorldNameAction } from "../../../actions";

export const dynamic = "force-dynamic";

export default async function WorldSettingsPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ msg?: string }> }) {
  const { id } = await params;
  const { msg } = await searchParams;
  const artV = listWorldArtVersions()[id];
  const b = getWorld(id);
  if (!b) notFound();
  const t = b.theme;
  const company: [string, string][] = b.info?.company ?? [["署名（送信者名）", b.sender], ["主な対象", b.audience]];
  const product: [string, string][] = b.info?.product ?? [
    ["提供価値", b.offering],
    ["フック商材", b.hook],
    ["訴求", b.hookPitch],
    ["ゴール", b.cta],
    ["安心材料", b.proof],
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-[10px] font-black tracking-widest text-slate-400">SETTINGS</div>
        <h1 className="text-xl font-black text-slate-900">設定</h1>
      </div>

      <Flash msg={msg} />

      <Card title="ワールド名（表示名）">
        <form action={saveWorldNameAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <input type="hidden" name="businessId" value={id} />
          <label className="text-[11px] font-bold text-slate-500">
            ワールドの名前（ポスター・ヘッダー）
            <input name="title" defaultValue={t.title} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
          </label>
          <label className="text-[11px] font-bold text-slate-500">
            事業名
            <input name="name" defaultValue={b.name} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal text-slate-900" />
          </label>
          <button className="rounded-lg px-4 py-2 text-xs font-black text-white" style={{ backgroundColor: t.accent }}>保存</button>
        </form>
        <form action={clearWorldNameAction} className="mt-2">
          <input type="hidden" name="businessId" value={id} />
          <button className="text-xs font-bold text-slate-500 underline hover:text-rose-600">標準の名前に戻す</button>
        </form>
      </Card>

      <Card title="サムネイル画像（ワールド選択のポスター・ヘッダー）">
        <div className="flex flex-wrap items-start gap-4">
          {artV ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/api/world-art/${id}?v=${encodeURIComponent(artV)}`} alt="現在のサムネイル" className="h-36 w-56 rounded-xl object-cover ring-1 ring-slate-200" />
          ) : (
            <div className="grid h-36 w-56 place-items-center rounded-xl bg-slate-100 text-xs text-slate-400">標準のイラスト</div>
          )}
          <div className="min-w-0 flex-1">
            <form action={saveWorldArtAction} encType="multipart/form-data" className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="businessId" value={id} />
              <input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white" />
              <button className="rounded-lg px-4 py-2 text-xs font-black text-white" style={{ backgroundColor: t.accent }}>この画像に差し替える</button>
            </form>
            {artV && (
              <form action={clearWorldArtAction} className="mt-2">
                <input type="hidden" name="businessId" value={id} />
                <button className="text-xs font-bold text-slate-500 underline hover:text-rose-600">標準のイラストに戻す</button>
              </form>
            )}
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">PNG / JPEG / WebP / GIF・5MBまで。横長の画像がきれいに収まります。ご自身で権利を持つ画像、または利用許可のある画像だけを使ってください（公式イラストやロゴなどの無断利用は避けてください）。</p>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="営業元"><Dl rows={company} /></Card>
        <Card title="商品"><Dl rows={product} /></Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title="営業方針・ルール">
          <ul className="space-y-2 text-sm text-slate-700">
            {b.guardrails.map((g) => <li key={g} className="flex gap-2"><span style={{ color: t.accent }}>◆</span>{g}</li>)}
            <li className="flex gap-2"><span style={{ color: t.accent }}>◆</span>送信前に必ず人が確認・承認する（自動では送らない）</li>
          </ul>
        </Card>
        <Card title="配信シーケンス">
          <ol className="space-y-1.5 text-sm">
            {SEQUENCE.map((q) => (
              <li key={q.key} className="flex items-center gap-3">
                <span className="grid h-6 w-7 place-items-center rounded-md bg-slate-100 font-mono text-[11px] font-bold text-slate-600">{q.key}</span>
                <span className="w-12 text-xs text-slate-400">+{q.dayOffset}日</span>
                <span className="text-slate-700">{q.label}</span>
                <span className="ml-auto text-xs text-slate-400">{q.channel === "call" ? "架電" : CHANNEL_LABEL[b.primaryChannel]}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card title="データ">
        <p className="text-sm text-slate-600">営業先・連絡先・履歴はサーバーのデータベース（data/portal.db）に保存されます。文面・商材・世界観は <code className="rounded bg-slate-100 px-1">src/lib/businesses.ts</code> で編集します。</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`/api/leads-csv?biz=${id}`} className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">リードをCSV書出</a>
          <Link href="/integrations" className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50">メール送信の設定</Link>
        </div>
      </Card>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-bold text-slate-800">{title}</h2>
      {children}
    </section>
  );
}

function Dl({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="space-y-2 text-sm">
      {rows.map(([k, v]) => (
        <div key={k} className="grid grid-cols-[6.5rem_1fr] gap-2">
          <dt className="text-slate-500">{k}</dt>
          <dd className={v === "未確認" ? "font-semibold text-amber-700" : "break-all text-slate-800"}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
