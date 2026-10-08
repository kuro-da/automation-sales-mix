/**
 * メディアブレイングループの事業定義。ポータル・自動営業フロー・ワールド画面の唯一の設定源。
 * 文面・フック商材・CTA・世界観はここを編集して調整する（コード側は事業IDを参照するだけ）。
 */
export type Channel = "email" | "line" | "call";

/** 世界観（ポータルのゲーム選択画面と事業ワールドの見た目。いずれもオリジナルの演出） */
export interface Theme {
  world: string; // 英字のワールド名
  title: string; // 和名の見出し
  tagline: string;
  motto: string;
  from: string; // 背景グラデーション開始
  to: string;
  accent: string;
  accent2: string;
  font: "serif" | "sans" | "display";
  pattern: "walls" | "slash" | "grid" | "neon" | "lantern" | "flame" | "ichimatsu" | "holo" | "lattice";
  genre: string;
}

export interface Business {
  id: string;
  name: string;
  short: string;
  color: string;
  hex: string;
  audience: string; // 主な対象
  offering: string; // 主力の提供価値
  hook: string; // 他事業から紹介するときの入口商材（フック）
  hookPitch: string; // フックの一言訴求
  cta: string; // アポ／来店／体験などのゴール
  proof: string; // Stage B で共有する「安心材料」の型
  primaryChannel: Exclude<Channel, "call">;
  kpis: string[];
  sender: string; // 署名に使う送信者名
  guardrails: string[]; // 営業上の守るべきルール
  draft?: boolean; // 事業内容が未設定のワールド（他ワールドのクロスセル提案には出さない）
  info?: BusinessInfo; // 営業元・商品の詳細（設定ページに表示）
  theme: Theme;
}

/** 営業元・商品の詳細。値が未確認のものは「未確認」と書き、営業文には使わない。 */
export interface BusinessInfo {
  company: [string, string][]; // 営業元
  product: [string, string][]; // 商品
}

export const BUSINESSES: Business[] = [
  {
    id: "agency",
    name: "代理店開拓",
    short: "代理店",
    color: "violet",
    hex: "#a16207",
    audience: "販売パートナー候補（代理店・個人事業主・他業種の法人）",
    offering: "取扱商材の代理店契約と営業支援（フック商材ポートフォリオ・研修）",
    hook: "代理店オンライン説明会",
    hookPitch: "初期投資を抑えて始められる代理店モデルを30分でご説明します",
    cta: "オンライン説明会／個別面談",
    proof: "既存代理店の立ち上がり期間・月次実績の目安と、サポート体制",
    primaryChannel: "email",
    kpis: ["説明会参加率", "契約率", "代理店の立ち上がり日数"],
    sender: "メディアブレイン　代理店担当",
    guardrails: ["実績の数字は確認済みのものだけを使う", "手ぶらで帰らない（必ず次の接点を確約）"],
    theme: {
      world: "THE EXPEDITION",
      title: "代理店開拓団",
      tagline: "壁の向こうに、まだ見ぬ販路がある。",
      motto: "開拓せよ。一歩ずつ、壁の外へ。",
      from: "#1c1410",
      to: "#4a3a22",
      accent: "#b91c1c",
      accent2: "#d6b86a",
      font: "serif",
      pattern: "walls",
      genre: "重厚・開拓団・城壁",
    },
  },
  {
    id: "sports",
    name: "スポーツ（健康）事業",
    short: "スポーツ",
    color: "emerald",
    hex: "#2563eb",
    audience: "個人会員候補・健康経営に取り組む法人",
    offering: "スポーツ・運動プログラム、健康づくりサポート",
    hook: "無料体験＋体組成測定",
    hookPitch: "運動が久しぶりの方でも安心の、体験と測定をセットでご案内しています",
    cta: "無料体験のご予約",
    proof: "体験者の声と、運動習慣が続いた方の変化の目安",
    primaryChannel: "line",
    kpis: ["体験参加率", "入会率", "継続率"],
    sender: "メディアブレイン　スポーツ事業",
    guardrails: ["効果・数値の断定表現は避ける（体験者の声として紹介）"],
    theme: {
      world: "BLUE ARENA",
      title: "ブルーアリーナ",
      tagline: "お前のエゴを、フィールドで証明しろ。",
      motto: "No.1の1点を、獲りに行く。",
      from: "#020617",
      to: "#0b1f4d",
      accent: "#2563eb",
      accent2: "#38bdf8",
      font: "display",
      pattern: "slash",
      genre: "スタイリッシュ・ストライカー・電光ブルー",
    },
  },
  {
    id: "oa",
    name: "OA・トナー・フック商材",
    short: "OA",
    color: "blue",
    hex: "#15803d",
    audience: "事業所の総務・経理・情シス・経営者",
    offering: "トナーカートリッジ・複合機・シュレッダーなどオフィス消耗品／機器",
    hook: "トナーお試しセット",
    hookPitch: "今お使いのプリンタ向けに、コスト比較用のお試しセットをご用意しています",
    cta: "15分のヒアリング（電話または訪問）",
    proof: "同業・同規模の事業所での年間コスト削減実績と、品質保証の内容",
    primaryChannel: "email",
    kpis: ["アポ獲得率", "初回受注率", "継続購入率"],
    sender: "メディアブレイン　営業担当",
    guardrails: ["銅未満で帰らない・手ぶらで帰らない（必ず次の接点を確約）", "既存の取引先を否定しない"],
    theme: {
      world: "ICHIMATSU CORPS",
      title: "市松ムダ退治隊",
      tagline: "コストの鬼を、斬れ。",
      motto: "一刀入魂。ムダを、断つ。",
      from: "#07140c",
      to: "#14532d",
      accent: "#dc2626",
      accent2: "#86efac",
      font: "serif",
      pattern: "ichimatsu",
      genre: "大正ロマン・市松模様・水の波紋",
    },
  },
  {
    id: "web",
    name: "Web制作・広告・DX支援",
    short: "Web/DX",
    color: "cyan",
    hex: "#0891b2",
    audience: "中小企業の経営者・広報／マーケ担当",
    offering: "Web制作・広告運用・業務のデジタル化支援",
    hook: "無料サイト／広告診断",
    hookPitch: "現在のサイトや広告の改善余地を無料で診断し、優先順位をお渡しします",
    cta: "30分のオンライン診断報告",
    proof: "近い業種の改善事例（問い合わせ数の変化など）と進め方",
    primaryChannel: "email",
    kpis: ["診断申込率", "提案率", "受注率"],
    sender: "メディアブレイン　Web/DX担当",
    guardrails: ["成果の保証表現は使わない（事例として紹介）"],
    theme: {
      world: "HOLO SEAL",
      title: "キラキラ・シール王国",
      tagline: "集めて、つなげて、売れる導線を完成させろ。",
      motto: "全員集合！キラキラの導線をそろえよう。",
      from: "#2a0a5e",
      to: "#0b3b8f",
      accent: "#ec4899",
      accent2: "#fde047",
      font: "display",
      pattern: "holo",
      genre: "ホログラムのシール・天使と悪魔のカードコレクション",
    },
  },
  {
    id: "food",
    name: "飲食事業",
    short: "飲食",
    color: "orange",
    hex: "#ea580c",
    audience: "近隣の法人・団体幹事・既存の個人顧客",
    offering: "宴会・会食・ケータリング・テイクアウト",
    hook: "平日ランチ／ドリンク1杯サービス券",
    hookPitch: "まずは気軽にお試しいただける、ご来店特典をお付けします",
    cta: "ご来店・ご予約",
    proof: "法人利用のお客様の声と、人数・予算別のコース例",
    primaryChannel: "line",
    kpis: ["来店率", "リピート率", "法人予約件数"],
    sender: "メディアブレイン　飲食事業",
    guardrails: ["アレルギー・提供条件は予約時に必ず確認する"],
    theme: {
      world: "IZAKAYA QUEST",
      title: "のれん街道",
      tagline: "今夜の一杯が、次の縁をつなぐ。",
      motto: "暖簾をくぐれば、そこは宴の戦場。",
      from: "#2a0a0a",
      to: "#7c2d12",
      accent: "#f97316",
      accent2: "#fde68a",
      font: "serif",
      pattern: "lantern",
      genre: "和・赤提灯・居酒屋ファンタジー",
    },
  },
  {
    id: "meat",
    name: "精肉・とことん871（富士ヶ嶺ポーク）",
    short: "精肉",
    color: "rose",
    hex: "#e11d48",
    audience: "山梨県内の飲食店（ホテルレストラン・焼肉・とんかつ・郷土料理など）",
    offering: "富士ヶ嶺丸一ポーク（富士ヶ嶺ポーク）の業務用卸",
    hook: "富士ヶ嶺ポーク 食べ比べ・限定企画のご提案",
    hookPitch: "今のお取引はそのままに、期間限定・別部位・食べ比べで「県産豚の新しい選択肢」をお試しいただけます",
    cta: "サンプル・試食のご案内（お電話でのご挨拶）",
    proof: "抗生物質を使わない独自飼料、富士山の伏流水、生産から加工までの一貫体制",
    primaryChannel: "email",
    kpis: ["サンプル請求率", "初回取引率", "定期発注率"],
    sender: "合同会社センヨフーズ　とことん871",
    guardrails: [
      "既存の仕入先・ブランド豚を否定しない（「切替」ではなく「期間限定・別用途・食べ比べ」）",
      "最低ロット・卸価格・配送エリア・温度帯は未確認のため、文面に書かない",
      "候補は公式サイト等で実在・連絡先を確認してから連絡する（デモ候補を確認済みとして扱わない）",
    ],
    info: {
      company: [
        ["正式名称", "合同会社センヨフーズ"],
        ["店舗名", "とことん871"],
        ["担当", "石坂・井出"],
        ["電話", "055-298-4871"],
        ["メール", "senyo@media-b.com"],
        ["住所", "〒409-3851 山梨県中巨摩郡昭和町河西1632-5"],
        ["Web", "https://tokoton871.jp/"],
        ["Instagram", "https://www.instagram.com/tokoton871/"],
      ],
      product: [
        ["商品", "富士ヶ嶺丸一ポーク（富士ヶ嶺ポーク）／山梨県富士ヶ嶺産"],
        ["特長①", "抗生物質を使用しない完全オリジナル飼料"],
        ["特長②", "富士山の伏流水を飲用水として使用"],
        ["特長③", "生産から加工までの一貫体制で鮮度を重視"],
        ["特長④", "肉本来の旨味とジューシーさを追求"],
        ["最低ロット", "未確認"],
        ["納品エリア", "未確認"],
        ["温度帯", "未確認"],
        ["卸価格", "未確認"],
      ],
    },
    theme: {
      world: "TOKOTON ARENA",
      title: "とことんアリーナ",
      tagline: "最高の一皿を、店の看板に。",
      motto: "肉に、とことん。",
      from: "#2b0612",
      to: "#7f1d1d",
      accent: "#e11d48",
      accent2: "#fbbf24",
      font: "display",
      pattern: "flame",
      genre: "炎・熱血・肉の頂上決戦",
    },
  },
  {
    id: "war",
    name: "天下開拓陣",
    short: "天下",
    color: "red",
    hex: "#b91c1c",
    audience: "新規開拓の営業先（事業内容は設定・businesses.ts で編集）",
    offering: "（未設定）この世界で扱う商材・サービス",
    hook: "（未設定）フック商材",
    hookPitch: "事業内容が決まり次第、ここに一言訴求を入力します",
    cta: "ご挨拶・ご提案のお約束",
    proof: "実績・事例（確認済みのものだけを使う）",
    primaryChannel: "email",
    kpis: ["アポ獲得率", "初回受注率", "継続率"],
    sender: "メディアブレイン　営業担当",
    draft: true,
    guardrails: [
      "事業内容が未設定のため、文面を実際に送る前に必ず商材・訴求を設定する",
      "実績の数字は確認済みのものだけを使う",
    ],
    theme: {
      world: "TENKA FRONTIER",
      title: "天下開拓陣",
      tagline: "天下を拓く一手は、まず足元の一軒から。",
      motto: "兵は拙速を尊ぶ。まずは一通、まずは一本。",
      from: "#1a0606",
      to: "#5b1212",
      accent: "#b91c1c",
      accent2: "#fbbf24",
      font: "serif",
      pattern: "lattice",
      genre: "古代中国の戦記・軍旗・城塞",
    },
  },
];

export function getBusiness(id: string): Business | undefined {
  return BUSINESSES.find((b) => b.id === id);
}

export function mustBusiness(id: string): Business {
  const b = getBusiness(id);
  if (!b) throw new Error(`unknown business: ${id}`);
  return b;
}

/** Stage C 用：その事業以外のフック商材を回す対象（事業間クロスセル） */
export function crossSellTargets(businessId: string): Business[] {
  return BUSINESSES.filter((b) => b.id !== businessId && !b.draft);
}

export const CHANNEL_LABEL: Record<Channel, string> = {
  email: "メール",
  line: "LINE",
  call: "架電タスク",
};
