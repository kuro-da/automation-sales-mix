import type { Business } from "./businesses";

/**
 * AI社員（既存「とことん871 AI営業オフィス」のキャラクター）。全事業のワールドで共通のチームとして働く。
 * 役割は営業フローの工程に対応する。
 */
export interface Staff {
  id: "scout" | "analyzer" | "planner" | "writer" | "manager" | "reviewer";
  name: string;
  role: string;
  tagline: string;
  rarity: "SSR" | "SR";
  move: string; // 必殺技
  stage: string; // 担当工程（ポータルのフローとの対応）
  skills: { name: string; level: number }[];
  task: (b: Business) => string;
}

export const STAFF: Staff[] = [
  {
    id: "scout",
    name: "ジョージ",
    role: "営業・候補発掘",
    tagline: "候補発掘のエース",
    rarity: "SSR",
    move: "ロックオン・サーチ",
    stage: "① 候補発掘（リード登録）",
    skills: [
      { name: "候補抽出力", level: 98 },
      { name: "優先順位付け", level: 94 },
      { name: "エリア網羅", level: 96 },
    ],
    task: (b) => `${b.audience}の有望な候補を探しています`,
  },
  {
    id: "analyzer",
    name: "カテネコ",
    role: "調査・分析",
    tagline: "調査・裏取り担当",
    rarity: "SR",
    move: "ウラ取りアイ",
    stage: "② 調査・裏取り",
    skills: [
      { name: "調査精度", level: 97 },
      { name: "連絡先収集", level: 92 },
      { name: "根拠整理", level: 95 },
    ],
    task: () => "候補の実在・連絡先・導入のきっかけを確認しています",
  },
  {
    id: "planner",
    name: "ケイビー",
    role: "提案・戦略",
    tagline: "提案設計の司令塔",
    rarity: "SSR",
    move: "選択肢アドオン",
    stage: "③ 提案設計（フック）",
    skills: [
      { name: "提案設計", level: 99 },
      { name: "用途展開", level: 95 },
      { name: "商談化率", level: 91 },
    ],
    task: (b) => `「${b.hook}」の提案角度を設計しています`,
  },
  {
    id: "writer",
    name: "ユウユウ",
    role: "営業文作成",
    tagline: "営業文の職人",
    rarity: "SR",
    move: "やわらか文面",
    stage: "④ 営業文作成（ドラフト）",
    skills: [
      { name: "文面品質", level: 98 },
      { name: "媒体対応", level: 94 },
      { name: "パーソナライズ", level: 93 },
    ],
    task: () => "リードごとのメール・LINE・架電メモを作成しています",
  },
  {
    id: "manager",
    name: "とことんぶー",
    role: "進行管理",
    tagline: "進行管理の要",
    rarity: "SR",
    move: "停滞ゼロ・タイムライン",
    stage: "⑤ 進行管理（A→B→C）",
    skills: [
      { name: "タスク管理", level: 97 },
      { name: "フォロー設計", level: 92 },
      { name: "全体最適", level: 94 },
    ],
    task: () => "次回接触日とステージの進行を管理しています",
  },
  {
    id: "reviewer",
    name: "カントク",
    role: "最終確認",
    tagline: "品質チェックの番人",
    rarity: "SSR",
    move: "送信前ジャッジ",
    stage: "⑥ 最終確認（人の承認）",
    skills: [
      { name: "最終確認", level: 99 },
      { name: "自然な表現", level: 95 },
      { name: "品質安定", level: 96 },
    ],
    task: () => "送信前の内容を確認し、人の承認を待っています",
  },
];
