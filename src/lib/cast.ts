import type { Staff } from "./staff";

/**
 * ワールドごとの物語に合わせたキャスト（名前・ひとこと・必殺技）。役割・担当工程・スキルは変えない。
 * 精肉は既存「とことん871」のマスコットをそのまま使うため、ここには含めない。
 * 名前はすべてオリジナル（既存作品の登場人物名は使わない）。
 */
type Id = Staff["id"];
export interface CastEntry {
  name: string;
  tagline: string;
  move: string;
}

export const CAST: Record<string, Record<Id, CastEntry>> = {
  // OA：市松ムダ退治隊（大正ロマン・コストの鬼を斬る）
  oa: {
    scout: { name: "ゲンジ", tagline: "鬼の気配を嗅ぎ分ける斬り込み隊士", move: "気配ロックオン" },
    analyzer: { name: "ミオ", tagline: "鬼の巣を見通す調査隊士", move: "月下の見通し" },
    planner: { name: "鉄心", tagline: "ムダ断ちの策を立てる柱", move: "一刀コスト断ち" },
    writer: { name: "あやめ", tagline: "言葉で心を開く筆の隊士", move: "やわらか一筆" },
    manager: { name: "タケゾウ", tagline: "隊の進行を支える要", move: "停滞斬り" },
    reviewer: { name: "百合", tagline: "送る前に見極める門番", move: "最終の関所" },
  },
  // 代理店開拓：開拓団（壁の向こうへ販路を拡げる）
  agency: {
    scout: { name: "カイ", tagline: "壁の外を駆ける先遣兵", move: "ワイヤーダッシュ" },
    analyzer: { name: "ミナ", tagline: "地形と相手を読む偵察兵", move: "望遠の目" },
    planner: { name: "ガルド", tagline: "開拓ルートを描く団長補佐", move: "陣形アドオン" },
    writer: { name: "ノエル", tagline: "旗印を言葉にする書記兵", move: "誓いの一文" },
    manager: { name: "ブルーノ", tagline: "補給と進行の管理官", move: "補給線キープ" },
    reviewer: { name: "セラ", tagline: "門を開ける前に確かめる番兵", move: "最終点呼" },
  },
  // スポーツ：ブルーアリーナ（エゴを証明するフィールド）
  sports: {
    scout: { name: "レン", tagline: "ゴールを嗅ぎ分けるストライカー", move: "ロックオン・シュート" },
    analyzer: { name: "ミナト", tagline: "相手の癖を読むアナリスト", move: "ピッチ・スキャン" },
    planner: { name: "ユウマ", tagline: "ゲームを組み立てる司令塔", move: "ワンタッチ・オファー" },
    writer: { name: "ハヤト", tagline: "決め手のパスを送るウイング", move: "ライン突破の一文" },
    manager: { name: "ソウ", tagline: "チームを走らせるキャプテン", move: "ハイプレス管理" },
    reviewer: { name: "ケイ", tagline: "最後を守るゴールキーパー", move: "完封チェック" },
  },
  // Web/DX：キラキラ・シール王国（ホログラムのシールカード）
  web: {
    scout: { name: "キラリ", tagline: "レアなシールを探し当てる収集家", move: "ホログラム・ロック" },
    analyzer: { name: "ルクス", tagline: "光の向きで本物を見抜く鑑定士", move: "プリズム解析" },
    planner: { name: "プリズ", tagline: "七色の導線を組み立てる設計者", move: "七色プラン" },
    writer: { name: "ホロ", tagline: "キラキラのコピーを書く職人", move: "キラキラ一筆" },
    manager: { name: "ジュエ", tagline: "コレクションの進行を見守る番人", move: "全員集合タイム" },
    reviewer: { name: "セイント", tagline: "貼る前に聖なる目で確かめる天使", move: "聖なる最終チェック" },
  },
  // 飲食：のれん街道（暖簾の宴）
  food: {
    scout: { name: "ふく", tagline: "新しいお客を呼び込む客引き", move: "招き猫ダッシュ" },
    analyzer: { name: "お梅", tagline: "お客の好みを聞き分ける仲居", move: "お品書きの目利き" },
    planner: { name: "源さん", tagline: "コースを組み立てる大将", move: "のれん分け企画" },
    writer: { name: "お花", tagline: "ご案内を書く看板娘", move: "筆書きご案内" },
    manager: { name: "清", tagline: "予約と段取りの番頭", move: "段取り八分" },
    reviewer: { name: "ちよ", tagline: "お出しする前に整える女将", move: "女将のひと磨き" },
  },
  // 天下開拓陣：古代中国の戦記（画像は ChatGPT で制作した先陣・斥候・軍師・伝令・兵站・守将）
  war: {
    scout: { name: "先陣", tagline: "真っ先に敵陣へ切り込む先鋒", move: "一番槍" },
    analyzer: { name: "斥候", tagline: "敵情を探り根拠を持ち帰る偵察", move: "夜駆けの目" },
    planner: { name: "軍師", tagline: "勝ち筋を描く参謀", move: "七手先の策" },
    writer: { name: "伝令", tagline: "言葉を戦場に届ける使者", move: "疾風の書状" },
    manager: { name: "兵站", tagline: "補給と進行を支える要", move: "糧道確保" },
    reviewer: { name: "守将", tagline: "城門で最後に見極める将", move: "城門の最終検分" },
  },
};
