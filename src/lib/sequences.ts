import type { Business, Channel } from "./businesses";

/**
 * 自動営業フローの定義。
 *  Stage A: アポ獲得（新規リード→初回配信→未反応なら架電）
 *  Stage B: 定期フォロー（アポ後〜商談中。「安心・共有」軸、停滞アラート）
 *  Stage C: 非成約者への別商材アプローチ（失注後、他事業のフック商材をローテーション）
 * dayOffset は「そのステージに入った日」からの日数。
 */
export type Stage = "A" | "B" | "C";

export type Purpose =
  | "first_contact"
  | "followup_nudge"
  | "call_script"
  | "final_notice"
  | "thanks_materials"
  | "case_share"
  | "status_check"
  | "stall_alert"
  | "cross_sell";

export interface Step {
  key: string;
  stage: Stage;
  dayOffset: number;
  channel: "primary" | "call";
  purpose: Purpose;
  label: string;
}

export const STAGE_LABEL: Record<Stage | "done", string> = {
  A: "A アポ獲得",
  B: "B 定期フォロー",
  C: "C 別商材アプローチ",
  done: "完了",
};

export const SEQUENCE: Step[] = [
  { key: "A1", stage: "A", dayOffset: 0, channel: "primary", purpose: "first_contact", label: "初回ご案内" },
  { key: "A2", stage: "A", dayOffset: 2, channel: "primary", purpose: "followup_nudge", label: "未反応フォロー" },
  { key: "A3", stage: "A", dayOffset: 5, channel: "call", purpose: "call_script", label: "架電（未反応者）" },
  { key: "A4", stage: "A", dayOffset: 9, channel: "primary", purpose: "final_notice", label: "最終ご案内" },
  { key: "B1", stage: "B", dayOffset: 1, channel: "primary", purpose: "thanks_materials", label: "お礼＋資料送付" },
  { key: "B2", stage: "B", dayOffset: 5, channel: "primary", purpose: "case_share", label: "安心材料・事例共有" },
  { key: "B3", stage: "B", dayOffset: 12, channel: "primary", purpose: "status_check", label: "検討状況の確認" },
  { key: "B4", stage: "B", dayOffset: 21, channel: "call", purpose: "stall_alert", label: "停滞アラート（担当者架電）" },
  { key: "C1", stage: "C", dayOffset: 7, channel: "primary", purpose: "cross_sell", label: "別商材 提案①" },
  { key: "C2", stage: "C", dayOffset: 30, channel: "primary", purpose: "cross_sell", label: "別商材 提案②" },
  { key: "C3", stage: "C", dayOffset: 60, channel: "primary", purpose: "cross_sell", label: "別商材 提案③" },
];

export function stepsFor(stage: Stage): Step[] {
  return SEQUENCE.filter((s) => s.stage === stage);
}

export interface DraftInput {
  business: Business; // リードが属する事業
  offer?: Business; // Stage C で提案する他事業
  company: string;
  contactName: string;
  step: Step;
  channel: Channel;
}

export interface Draft {
  subject: string;
  body: string;
}


function greet(company: string, name: string): string {
  return name ? `${company}\n${name} 様` : `${company}\nご担当者様`;
}

/** 事業設定から決定論的に作るテンプレ文面（AIなしでも必ず動く）。AIでの清書は別操作。 */
export function buildDraft(i: DraftInput): Draft {
  const { business: b, offer, company, contactName, step } = i;
  const to = greet(company, contactName);
  const short = i.channel === "line";
  const wrap = (subject: string, lines: string[]): Draft => {
    const text = short
      ? lines.join("\n")
      : `${to}\n\nいつもお世話になっております。${b.sender}です。\n\n${lines.join("\n\n")}\n\n${b.sender}`;
    return { subject, body: short ? `${contactName || "ご担当者"}様\n${text}` : text };
  };

  switch (step.purpose) {
    case "first_contact":
      return wrap(`【${b.short}】${b.hook}のご案内`, [
        `${b.audience}の皆さまに、${b.offering}をご案内しております。`,
        b.hookPitch + "。",
        `まずは「${b.cta}」だけでもいかがでしょうか。ご都合のよい日時をご返信ください。`,
      ]);
    case "followup_nudge":
      return wrap(`Re:【${b.short}】${b.hook}のご案内`, [
        `先日お送りした${b.hook}の件、念のため再度ご連絡いたしました。`,
        `お忙しければ、「興味あり／今は不要」の一言だけでもご返信いただけると助かります。`,
        `ご希望があれば${b.cta}の候補日をこちらから複数お出しします。`,
      ]);
    case "call_script":
      return {
        subject: `架電タスク：${company}`,
        body: [
          `【目的】メール未反応のため、${b.cta}の約束を取る`,
          `【オープニング】メディアブレインの○○です。先日${b.hook}のご案内をお送りしました。1分だけよろしいですか？`,
          `【ヒアリング1】現在の状況（${b.audience}としての課題・困りごと）は？`,
          `【提案】${b.hookPitch}。まずは${b.cta}でいかがでしょう？`,
          `【切り返し】「間に合ってる」→ 比較材料として無料で試せる点を伝え、手ぶらで帰らず次の接点（資料送付・再架電日）を確約する`,
          `【結果記録】アポ取得 / 資料送付で継続 / 不要（理由を記入）`,
        ].join("\n"),
      };
    case "final_notice":
      return wrap(`【最終のご案内】${b.hook}`, [
        `これまで${b.hook}のご案内を差し上げてまいりました。今回を最後のご案内とさせていただきます。`,
        `ご関心がございましたら、このメールにご返信ください。${b.cta}を優先的にお取りします。`,
        `ご不要の場合はご放念ください。今後の案内を停止したい場合もお知らせください。`,
      ]);
    case "thanks_materials":
      return wrap(`${b.cta}のお礼と資料のご送付`, [
        `先日はお時間をいただきありがとうございました。`,
        `お話しした内容を資料にまとめましたのでご確認ください。（${b.offering}）`,
        `ご不明点は、いつでもこのメールにご返信ください。`,
      ]);
    case "case_share":
      return wrap(`ご検討の参考に：${b.short}の事例のご共有`, [
        `ご検討にあたって気になりやすい点について、${b.proof}をまとめました。`,
        `「他社ではどう進めているか」の参考としてご覧ください。売り込みではなく情報共有です。`,
      ]);
    case "status_check":
      return wrap(`その後のご状況はいかがでしょうか`, [
        `${b.offering}の件、その後のご検討状況はいかがでしょうか。`,
        `社内の確認事項や、比較中の条件があれば遠慮なくお知らせください。判断材料の追加をご用意します。`,
      ]);
    case "stall_alert":
      return {
        subject: `【停滞アラート】${company}`,
        body: [
          `【状況】${company}は検討開始から3週間以上、返信がありません。`,
          `【アクション】担当者から直接架電し、判断を止めている理由（時期・予算・決裁者・他社比較）を1つだけ特定する。`,
          `【ゴール】次回接点の日付を確定。難しければ B 終了条件（失注）の判断をリードのステータスに記録する。`,
        ].join("\n"),
      };
    case "cross_sell": {
      const o = offer ?? b;
      return wrap(`${company}様へ：${o.hook}のご案内`, [
        `以前は${b.short}の件でご連絡しておりました。実は弊社では${o.name}も行っており、${o.audience}の方にご好評をいただいております。`,
        `${o.hookPitch}。`,
        `ご関心があれば「${o.cta}」をご案内します。ご不要であればご放念ください。`,
      ]);
    }
  }
}
