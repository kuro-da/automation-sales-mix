export interface Scenario {
  id: string;
  title: string;
  /** 営業側のゴール */
  goal: string;
  /** 顧客側の当日の状況・前提 */
  customerContext: string;
  /** よく出る詰まりポイント */
  stuckPoints: string[];
  /** 相性のよいペルソナ（UIの推奨表示用。指定しなくても選べる） */
  recommendedPersonaIds: string[];
}

export const SCENARIOS: Scenario[] = [
  {
    id: "cold-call",
    title: "新規テレアポ（リストへの初架電）",
    goal: "資料送付の許可を得て、次回の電話 or 訪問の約束を取り付ける。",
    customerContext:
      "面識なし。番号リストからの初めての電話。相手は業務中で、営業電話だと分かった瞬間に切りたい心理。",
    stuckPoints: [
      "名乗った直後に『営業ですよね、結構です』",
      "用件を話す前に『忙しいので』",
      "『資料だけメールで』でかわされ次につながらない",
    ],
    recommendedPersonaIds: ["busy-somu", "gatekeeper", "skeptical-shacho"],
  },
  {
    id: "need-digging",
    title: "「トナー代、そんなに気にしてない」層のニーズ喚起",
    goal: "現状の印刷コスト・発注の手間を具体化し、『一度見直す価値がある』と思わせる。",
    customerContext:
      "コストは意識しているが緊急ではない。今のやり方で回っているので、変える動機が薄い。",
    stuckPoints: [
      "『特に困ってないですよ』で会話が終わる",
      "質問しても『分からない、担当じゃない』",
      "こちらが一方的に説明して相手が受け身になる",
    ],
    recommendedPersonaIds: ["busy-somu", "price-keiri", "loyal-lease"],
  },
  {
    id: "objection-fine",
    title: "「間に合ってます」を突破する",
    goal: "『間に合っている』の中身を分解し、隠れた不満・コストを一点だけ引き出してアポにつなげる。",
    customerContext:
      "現状に大きな不満はない。反射的に『間に合ってます』と言っているだけのことも多い。",
    stuckPoints: [
      "『間に合ってます』への切り返しが思いつかず引き下がる",
      "食い下がると『しつこいな』と関係が悪化",
      "質問が詰問っぽくなって警戒される",
    ],
    recommendedPersonaIds: ["busy-somu", "loyal-lease", "skeptical-shacho"],
  },
  {
    id: "objection-lease",
    title: "「複合機のリース契約があるから」への切り返し",
    goal: "『リースは今のまま、トナーだけ』の分離提案を理解させ、比較検討のテーブルに乗せる。",
    customerContext:
      "複合機＋トナー＋保守を1社に一括している。契約が残っており、乗り換え＝面倒・気まずいと感じている。",
    stuckPoints: [
      "『契約あるので無理です』で会話終了",
      "リース残債・違約金の話で腰が引ける",
      "既存業者への義理を持ち出されて返せない",
    ],
    recommendedPersonaIds: ["loyal-lease", "quality-worry", "skeptical-shacho"],
  },
  {
    id: "closing-hesitation",
    title: "クロージング直前の「社内で検討します」",
    goal: "曖昧な『検討』を、誰が・いつ・何を決めるかまで具体化し、次アクションの日時を仮押さえする。",
    customerContext:
      "提案内容はおおむね理解し悪くないと思っている。だが決め切る理由がなく、先送りしたい。",
    stuckPoints: [
      "『検討します』に『よろしくお願いします』で返して終わる",
      "次回連絡日を決められない",
      "誰が決裁者か分からないまま引く",
    ],
    recommendedPersonaIds: ["price-keiri", "quality-worry", "skeptical-shacho"],
  },
  {
    id: "upsell-existing",
    title: "既存客へのアップセル（シュレッダー・複合機・備品）",
    goal: "トナー取引の信頼を土台に、周辺のオフィス機器・消耗品へ提案を広げ、次の商談を設定する。",
    customerContext:
      "トナーは継続購入中で関係は良好。ただ「トナーの人」と認識されており、他は別ルートで買っている。",
    stuckPoints: [
      "『トナー以外は別で頼んでるので』で止まる",
      "何を提案していいか的が絞れず散漫になる",
      "『また今度』でクロージングできない",
    ],
    recommendedPersonaIds: ["busy-somu", "price-keiri", "loyal-lease"],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
