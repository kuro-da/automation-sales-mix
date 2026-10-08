import { STAFF } from "@/lib/staff";
import type { CharacterRecord } from "@/lib/crm";
import { saveCharacterAction } from "@/app/actions";

const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200";
const label = "mb-1 block text-[11px] font-bold text-slate-500";

/** キャラクターの登録・編集フォーム。既存6役を置き換えるか、追加メンバーとして登録する。 */
export function CharacterForm({ businessId, c, accent }: { businessId: string; c?: CharacterRecord; accent: string }) {
  const sk = [0, 1, 2].map((i) => c?.skills[i]);
  return (
    <form action={saveCharacterAction} className="grid gap-3 sm:grid-cols-2" encType="multipart/form-data">
      <input type="hidden" name="businessId" value={businessId} />
      {c && <input type="hidden" name="id" value={c.id} />}

      <div>
        <label className={label}>名前 *</label>
        <input name="name" required defaultValue={c?.name} placeholder="例: 炭治郎" className={input} />
      </div>
      <div>
        <label className={label}>役割（肩書き）</label>
        <input name="role" defaultValue={c?.role} placeholder="例: 候補発掘・切り込み隊長" className={input} />
      </div>
      <div>
        <label className={label}>登録のしかた</label>
        <select name="replaces" defaultValue={c?.replaces ?? ""} className={input}>
          <option value="">追加メンバーとして席を増やす</option>
          {STAFF.map((s) => (
            <option key={s.id} value={s.id}>{s.name}（{s.role}）を置き換える</option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>レア度</label>
        <select name="rarity" defaultValue={c?.rarity ?? "SR"} className={input}>
          <option value="SR">SR</option>
          <option value="SSR">SSR</option>
        </select>
      </div>
      <div>
        <label className={label}>ひとこと紹介</label>
        <input name="tagline" defaultValue={c?.tagline} placeholder="例: 鼻が利く切り込み役" className={input} />
      </div>
      <div>
        <label className={label}>必殺技</label>
        <input name="move" defaultValue={c?.move} placeholder="例: 一刀コスト断ち" className={input} />
      </div>
      <div>
        <label className={label}>担当工程</label>
        <input name="stage" defaultValue={c?.stage} placeholder="例: ① 候補発掘" className={input} />
      </div>
      <div>
        <label className={label}>作業内容（プロフィールに表示）</label>
        <input name="task" defaultValue={c?.task} placeholder="例: 有望な事業所を探しています" className={input} />
      </div>

      <div className="sm:col-span-2">
        <label className={label}>スキル（最大3つ・名前とレベル0〜100）</label>
        <div className="grid gap-2 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-2">
              <input name={`skill${i}`} defaultValue={sk[i - 1]?.name} placeholder={`スキル${i}`} className={input} />
              <input name={`level${i}`} type="number" min={0} max={100} defaultValue={sk[i - 1]?.level ?? 80} className={`${input} w-20`} />
            </div>
          ))}
        </div>
      </div>

      <div className="sm:col-span-2">
        <label className={label}>画像（PNG / JPEG / WebP / GIF・3MBまで）{c?.hasImage && "｜未選択なら現在の画像のまま"}</label>
        <input name="image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-xs file:font-bold file:text-white hover:file:bg-slate-700" />
        <p className="mt-1 text-[11px] text-slate-400">ご自身で権利を持つ画像、または利用許可のある画像を使ってください。</p>
      </div>

      <div className="sm:col-span-2">
        <button className="rounded-lg px-6 py-2.5 text-sm font-black text-white shadow transition hover:scale-105" style={{ backgroundColor: accent }}>
          {c ? "変更を保存" : "キャラクターを登録"}
        </button>
      </div>
    </form>
  );
}
