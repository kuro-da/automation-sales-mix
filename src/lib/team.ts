import type { Business } from "./businesses";
import { listCharacters, type CharacterRecord } from "./crm";
import { STAFF, type Staff } from "./staff";
import type { Lines } from "./meeting";
import { CAST } from "./cast";

/** ワールドごとのチーム編成：既存6役（登録キャラで置き換え可）＋追加メンバー。 */
export interface TeamMember {
  key: string; // 一意キー（既存は staff id、登録キャラは character id）
  baseId: Staff["id"] | null; // 既存6役のどれに対応するか（追加メンバーは null）
  characterId: string | null;
  name: string;
  role: string;
  tagline: string;
  rarity: "SSR" | "SR";
  move: string;
  stage: string;
  task: string;
  skills: { name: string; level: number }[];
  portrait: string;
  card: string;
  custom: boolean;
  work: string[]; // 作業中のセリフ
  meet: string[]; // 会議中のセリフ
  act: string; // 実際のリード名を入れる作業セリフ（{lead} を置換）
}

const ACT: Record<Staff["id"], string> = {
  scout: "「{lead}」をロックオン！",
  analyzer: "「{lead}」の連絡先・根拠を確認中…",
  planner: "「{lead}」向けの提案角度を設計中",
  writer: "「{lead}」宛の文面を作成中",
  manager: "「{lead}」のフォロー予定を登録中",
  reviewer: "「{lead}」の送信前チェック中（承認は人が行います）",
};

const imgUrl = (c: CharacterRecord) => `/api/characters/${c.id}/image?v=${encodeURIComponent(c.updatedAt)}`;

export function buildTeam(b: Business, working: Lines, meeting: Lines): TeamMember[] {
  const chars = listCharacters(b.id);
  const team: TeamMember[] = [];

  for (const st of STAFF) {
    const o = chars.find((c) => c.replaces === st.id);
    const cast = CAST[b.id]?.[st.id]; // ワールドの物語に合わせたキャスト（精肉は元のマスコット）
    const art = cast ? `/api/avatar/${b.id}/${st.id}` : null;
    team.push({
      key: o ? o.id : st.id,
      baseId: st.id,
      characterId: o?.id ?? null,
      name: o?.name || cast?.name || st.name,
      role: o?.role || st.role,
      tagline: o?.tagline || cast?.tagline || st.tagline,
      rarity: o ? o.rarity : st.rarity,
      move: o?.move || cast?.move || st.move,
      stage: o?.stage || st.stage,
      task: o?.task || st.task(b),
      skills: o && o.skills.length > 0 ? o.skills : st.skills,
      portrait: o?.hasImage ? imgUrl(o) : (art ?? `/staff/${st.id}-portrait.png`),
      card: o?.hasImage ? imgUrl(o) : (art ?? `/staff/${st.id}-card.png`),
      custom: !!o,
      work: working[st.id],
      meet: meeting[st.id],
      act: ACT[st.id],
    });
  }

  for (const c of chars.filter((x) => !x.replaces)) {
    const role = c.role || "メンバー";
    team.push({
      key: c.id,
      baseId: null,
      characterId: c.id,
      name: c.name,
      role,
      tagline: c.tagline,
      rarity: c.rarity,
      move: c.move,
      stage: c.stage || "追加メンバー",
      task: c.task || `${role}を担当しています`,
      skills: c.skills,
      portrait: c.hasImage ? imgUrl(c) : "/staff/manager-portrait.png",
      card: c.hasImage ? imgUrl(c) : "/staff/manager-card.png",
      custom: true,
      work: [`${role}、進めます！`, "いい流れです！", "引き継ぎ内容を確認中です"],
      meet: ["現場の状況を共有します！", "次のアクションに協力します！"],
      act: `「{lead}」について${role}を進めています`,
    });
  }
  return team.slice(0, 10); // オフィスの席は最大10名
}
