import type { Business } from "./businesses";
import type { WorldStats } from "./crm";
import type { Staff } from "./staff";

export type Lines = Record<Staff["id"], string[]>;

export interface MeetingScript {
  working: Lines;
  meeting: Lines;
  agenda: { label: string; value: string; tone: "ok" | "warn" | "info" }[];
  nextActions: { who: string; text: string; href: string }[];
}

interface Counts {
  a: number;
  b: number;
  c: number;
  stalledB: number;
}

/**
 * 会議室のセリフと議題。実際の件数から作るので、会議の内容がその日の状況を映す。
 * 精肉は既存「とことん871 AI営業オフィス」のセリフを踏襲する。
 */
export function buildMeeting(b: Business, s: WorldStats, c: Counts): MeetingScript {
  const meat = b.id === "meat";

  const working: Lines = meat
    ? {
        scout: ["今日は新しい有望店を3件ロックします！", "このお店、相性スコア高めです！", "県産豚メニューの匂いがします…！"],
        analyzer: ["連絡先もセットで回収します！", "Instagram導線、見つけました！", "メニュー構成を解析中です…"],
        planner: ["食べ比べ提案、かなり刺さりそうです！", "限定導入ルートで組み立てます！", "切替ではなく“追加提案”で行きます！"],
        writer: ["押し売り感ゼロの文面に仕上げます！", "DM版もメール版も整えます！", "やわらかく、でも伝わる一文にします！"],
        manager: ["次回フォローまで管理します！", "案件の渋滞、解消していきます！", "全体進行、いいテンポです！"],
        reviewer: ["最終確認はお任せください！", "温度感チェック、良好です！", "表現の尖りをまるく整えます！"],
      }
    : {
        scout: [`${b.audience}の有望候補を探します！`, "相性スコア高めの先を見つけました！", "今日は新しい候補をロックします！"],
        analyzer: ["連絡先もセットで回収します！", "公式情報で裏取り中です…", "根拠URLを整理しています！"],
        planner: [`「${b.hook}」で入口を作ります！`, "相手に合わせた提案角度で行きます！", "売り込みでなく“選択肢の追加”で提案！"],
        writer: ["返信しやすい一文で締めます！", "メール版もLINE版も整えます！", "やわらかく、でも伝わる文面にします！"],
        manager: ["次回フォローまで管理します！", "停滞している案件を拾います！", "全体進行、いいテンポです！"],
        reviewer: ["最終確認はお任せください！", "送るのは人の承認のあと、です！", "表現の尖りをまるく整えます！"],
      };

  const meeting: Lines = {
    scout: [s.leads > 0 ? `リードは現在 ${s.leads} 件。次は上位ランクを厚くします！` : "まず最初の候補を登録しましょう！", meat ? "甲府エリアはまだ掘れます！" : "新規の流入元も増やしたいです！"],
    analyzer: ["電話・メール・DMの連絡導線を補完します！", "連絡先が薄い先は優先調査に回します！"],
    planner: [meat ? "食べ比べ企画が今回の主軸ですね！" : `今回の主軸は「${b.hook}」で行きましょう！`, "失注先には他事業のフックも用意します！"],
    writer: [s.drafts > 0 ? `ドラフトが ${s.drafts} 件、承認待ちです！` : "新しいドラフトを仕込みます！", "最初の一通目はやさしく入ります！"],
    manager: [c.stalledB > 0 ? `Bで停滞中が ${c.stalledB} 件。今日フォローします！` : "停滞はゼロ。いい流れです！", "では次アクションを配布します！"],
    reviewer: ["送信前の最後のひと磨きに入ります！", "送信は必ず人が承認してからです！"],
  };

  const agenda: MeetingScript["agenda"] = [
    { label: "A アポ獲得中", value: `${c.a} 件`, tone: "info" },
    { label: "B 定期フォロー", value: `${c.b} 件`, tone: "info" },
    { label: "C 別商材提案", value: `${c.c} 件`, tone: "info" },
    { label: "承認待ち", value: `${s.drafts} 件`, tone: s.drafts > 0 ? "warn" : "ok" },
    { label: "成約", value: `${s.won} 件`, tone: s.won > 0 ? "ok" : "info" },
  ];

  const nextActions: MeetingScript["nextActions"] = [];
  if (s.drafts > 0) nextActions.push({ who: "カントク", text: `承認待ち ${s.drafts} 件を確認して送信する`, href: "/outbox" });
  if (c.stalledB > 0) nextActions.push({ who: "とことんぶー", text: `停滞中の ${c.stalledB} 件に架電フォローする`, href: `/leads?biz=${b.id}` });
  if (c.a > 0) nextActions.push({ who: "ジョージ", text: `Stage A の ${c.a} 件のうち、未接触の候補から連絡する`, href: `/leads?biz=${b.id}` });
  nextActions.push({ who: "ケイビー", text: `「${b.hook}」の提案角度を見直す`, href: `/b/${b.id}` });
  if (meat) nextActions.push({ who: "カテネコ", text: "公式確認前の候補の実在・連絡先を確認する", href: "/b/meat" });

  return { working, meeting, agenda, nextActions };
}
