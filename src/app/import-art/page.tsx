import { BUSINESSES } from "@/lib/businesses";
import { STAFF } from "@/lib/staff";
import { PageHeader } from "@/components/badges";
import { Flash } from "@/components/Flash";
import { bulkImportArtAction, importFromFolderAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function ImportArtPage({ searchParams }: { searchParams: Promise<{ msg?: string; ok?: string }> }) {
  const { msg, ok } = await searchParams;
  return (
    <div className="space-y-6">
      <PageHeader title="画像一括取込" desc="ChatGPTなどで作ったキャラクター画像・サムネイル画像を、ファイル名のルールに従ってまとめて反映します。" />
      <Flash msg={msg} ok={ok !== "0"} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-bold text-slate-800">プロジェクト内の画像をまとめて取り込む</h2>
        <p className="mb-3 text-xs text-slate-500">assets/import フォルダ（元画像 assets/originals から取り込み用に変換したコピー：キャラ1024×1024、サムネイル幅1600）の全ファイルを反映します。同名は上書き。元画像は変更しません。</p>
        <form action={importFromFolderAction}>
          <button className="rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-black text-white shadow hover:bg-slate-700">assets/import から取り込む</button>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-slate-800">画像を選んで取り込む</h2>
        <form action={bulkImportArtAction} encType="multipart/form-data" className="space-y-3">
          <input
            name="files"
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-slate-700"
          />
          <button className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-black text-white shadow hover:bg-brand-700">取り込む</button>
          <p className="text-xs text-slate-400">キャラは3MBまで、サムネイルは5MBまで。同じファイル名で取り込み直すと上書きされます。</p>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-sm font-bold text-slate-800">ファイル名のルール</h2>
        <p className="text-sm text-slate-600">
          キャラ画像は <code className="rounded bg-slate-100 px-1">ワールドID_役割ID.png</code>、サムネイルは <code className="rounded bg-slate-100 px-1">ワールドID_thumb.png</code>（例：<code className="rounded bg-slate-100 px-1">oa_scout.png</code>、<code className="rounded bg-slate-100 px-1">oa_thumb.png</code>）。
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-1 text-xs font-bold text-slate-500">ワールドID</div>
            <ul className="space-y-1 text-sm">
              {BUSINESSES.map((b) => (
                <li key={b.id} className="flex items-center gap-2">
                  <code className="w-16 rounded bg-slate-100 px-1.5 py-0.5 text-xs">{b.id}</code>
                  <span className="text-slate-700">{b.theme.title}（{b.name}）</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-1 text-xs font-bold text-slate-500">役割ID（全ワールド共通）</div>
            <ul className="space-y-1 text-sm">
              {STAFF.map((s) => (
                <li key={s.id} className="flex items-center gap-2">
                  <code className="w-20 rounded bg-slate-100 px-1.5 py-0.5 text-xs">{s.id}</code>
                  <span className="text-slate-700">{s.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 text-sm">
          デザインの依頼文・ワールド別の人物像の一覧は{" "}
          <a href="/docs/chatgpt-character-brief.md" target="_blank" rel="noreferrer" className="font-bold text-brand-600 hover:underline">ChatGPT用 キャラクターデザイン依頼書 ↗</a>{" "}
          にまとめています。
        </p>
      </section>
    </div>
  );
}
