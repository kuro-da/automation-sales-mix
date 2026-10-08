import type { Theme } from "./businesses";

/**
 * ワールドごとのキャラクター画像（オリジナルのSVG）。
 * 顔立ち（髪型・肌・目）は6役ごとに変え、衣装と小物をワールドの物語に合わせる。
 * 役割バッジの漢字：発=候補発掘 / 調=調査 / 提=提案 / 文=営業文 / 進=進行管理 / 確=最終確認
 */
const ROLE_GLYPH = ["発", "調", "提", "文", "進", "確"];
const SKIN = ["#fcd9b8", "#f5c7a1", "#fde2c8", "#e8b78d", "#f9d0ae", "#fbd8c0"];
const HAIR = ["#1f2937", "#7c2d12", "#111827", "#4b5563", "#92400e", "#1e1b4b"];

export const STAFF_INDEX = ["scout", "analyzer", "planner", "writer", "manager", "reviewer"];

function hairShape(style: number, c: string): string {
  switch (style % 6) {
    case 0: // 逆立った短髪
      return `<path d="M52 92 L56 48 L72 66 L82 36 L96 62 L110 34 L122 64 L140 46 L146 92 Q100 70 52 92Z" fill="${c}"/>`;
    case 1: // ボブ
      return `<path d="M48 110 Q44 44 100 40 Q156 44 152 110 L140 104 Q136 66 100 64 Q64 66 60 104Z" fill="${c}"/>`;
    case 2: // 長髪
      return `<path d="M46 150 Q40 40 100 38 Q160 40 154 150 L142 150 Q144 70 100 66 Q56 70 58 150Z" fill="${c}"/>`;
    case 3: // 七三分け
      return `<path d="M50 96 Q52 42 104 40 Q150 44 150 96 L138 80 Q110 62 74 82Z" fill="${c}"/>`;
    case 4: // お団子
      return `<circle cx="100" cy="30" r="16" fill="${c}"/><path d="M50 100 Q50 44 100 42 Q150 44 150 100 L138 84 Q100 62 62 84Z" fill="${c}"/>`;
    default: // ツーブロ風
      return `<path d="M52 96 Q54 40 100 38 Q148 40 148 96 L136 70 Q100 56 64 70Z" fill="${c}"/>`;
  }
}

function outfit(pattern: Theme["pattern"], t: Theme, idx: number): { body: string; front: string; head: string } {
  const a = t.accent;
  const b = t.accent2;
  switch (pattern) {
    case "ichimatsu": {
      const squares: string[] = [];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) if ((r + c) % 2 === 0) squares.push(`<rect x="${34 + c * 16.5}" y="${160 + r * 16}" width="16.5" height="16" fill="#16a34a"/>`);
      return {
        body: `<path d="M20 240 L28 170 Q100 148 172 170 L180 240Z" fill="#0b0f0c"/><clipPath id="h"><path d="M20 240 L28 170 Q100 148 172 170 L180 240Z"/></clipPath><g clip-path="url(#h)">${squares.join("")}</g><path d="M84 160 L100 200 L116 160" fill="#f1f5f9"/>`,
        front: `<line x1="150" y1="140" x2="184" y2="70" stroke="#d1d5db" stroke-width="5" stroke-linecap="round"/><rect x="144" y="138" width="14" height="6" rx="2" fill="#111" transform="rotate(-25 151 141)"/>`,
        head: `<rect x="50" y="78" width="100" height="9" fill="${a}"/>`,
      };
    }
    case "walls":
      return {
        body: `<path d="M18 240 L28 168 Q100 146 172 168 L182 240Z" fill="#365314"/><path d="M60 160 L100 214 L140 160 L128 156 L100 190 L72 156Z" fill="#f5f5f4"/>`,
        front: `<g transform="translate(70 200)"><path d="M0 0 q14 -14 30 0 q14 -14 30 0 q-14 10 -30 8 q-16 2 -30 -8z" fill="${b}" opacity="0.95"/></g><path d="M40 168 q60 -22 120 0" stroke="${a}" stroke-width="7" fill="none"/>`,
        head: ``,
      };
    case "slash":
      return {
        body: `<path d="M22 240 L30 170 Q100 150 170 170 L178 240Z" fill="${a}"/><path d="M22 240 L30 170 L58 166 L52 240Z" fill="#0b1738"/><path d="M178 240 L170 170 L142 166 L148 240Z" fill="#0b1738"/><text x="100" y="226" text-anchor="middle" font-size="46" font-weight="900" font-style="italic" fill="#fff" font-family="Impact,Arial Black,sans-serif">${idx + 1}</text>`,
        front: ``,
        head: `<rect x="48" y="76" width="104" height="8" fill="${b}"/><path d="M148 80 l26 -8 l-4 14z" fill="${b}"/>`,
      };
    case "neon":
      return {
        body: `<path d="M18 240 L28 170 Q100 146 172 170 L182 240Z" fill="#1e1b4b"/><path d="M70 160 Q100 190 130 160" stroke="${b}" stroke-width="5" fill="none"/><rect x="92" y="196" width="16" height="30" rx="3" fill="${a}" opacity="0.7"/>`,
        front: ``,
        head: `<path d="M44 96 Q44 36 100 34 Q156 36 156 96" stroke="${a}" stroke-width="8" fill="none"/><rect x="38" y="90" width="16" height="30" rx="8" fill="${a}"/><rect x="146" y="90" width="16" height="30" rx="8" fill="${a}"/><rect x="62" y="96" width="76" height="16" rx="8" fill="${b}" opacity="0.8"/>`,
      };
    case "lantern":
      return {
        body: `<path d="M18 240 L28 170 Q100 148 172 170 L182 240Z" fill="#1e293b"/><path d="M84 158 L100 200 L116 158" fill="#fff7ed"/><path d="M28 170 L44 240 M172 170 L156 240" stroke="#f8fafc" stroke-width="3" opacity="0.7"/><text x="100" y="230" text-anchor="middle" font-size="30" font-weight="900" fill="#fde68a" font-family="serif">${["福", "梅", "源", "花", "清", "千"][idx]}</text>`,
        front: ``,
        head: `<rect x="46" y="76" width="108" height="14" fill="#fff"/><circle cx="100" cy="83" r="6" fill="${a}"/>`,
      };
    case "flame":
      return {
        body: `<path d="M20 240 L28 172 Q100 150 172 172 L180 240Z" fill="#f8fafc"/><path d="M76 164 L100 226 L124 164" fill="${a}"/><rect x="40" y="226" width="120" height="14" fill="${b}"/>`,
        front: ``,
        head: `<path d="M52 82 Q52 22 100 22 Q148 22 148 82 Z" fill="#fff"/><rect x="48" y="76" width="104" height="12" rx="4" fill="${a}"/>`,
      };
    case "holo": {
      const angel = idx % 2 === 0;
      return {
        body: `${angel ? `<path d="M96 170 Q22 120 16 196 Q50 168 92 196Z" fill="#fff"/><path d="M104 170 Q178 120 184 196 Q150 168 108 196Z" fill="#fff"/>` : `<path d="M96 176 Q30 150 28 214 Q60 190 94 206Z" fill="#4c1d95"/><path d="M104 176 Q170 150 172 214 Q140 190 106 206Z" fill="#4c1d95"/>`}<path d="M24 240 L32 172 Q100 150 168 172 L176 240Z" fill="${angel ? "#ffffff" : "#6d28d9"}"/><path d="M84 160 L100 196 L116 160" fill="${a}"/><rect x="30" y="224" width="140" height="10" fill="#fde047"/>`,
        front: `<path d="M30 60 l5 -12 l5 12 l12 5 l-12 5 l-5 12 l-5 -12 l-12 -5z" fill="#fff"/><path d="M160 150 l4 -9 l4 9 l9 4 l-9 4 l-4 9 l-4 -9 l-9 -4z" fill="#fff"/>`,
        head: angel
          ? `<ellipse cx="100" cy="30" rx="30" ry="8" fill="none" stroke="#fde047" stroke-width="6"/>`
          : `<path d="M62 62 L50 24 L84 50Z M138 62 L150 24 L116 50Z" fill="#7f1d1d"/>`,
      };
    }
    default:
      return {
        body: `<path d="M20 240 L28 170 Q100 148 172 170 L180 240Z" fill="${a}"/>`,
        front: ``,
        head: ``,
      };
  }
}

function bgBlock(t: Theme): string {
  if (t.pattern === "holo") {
    return `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5fa2"/><stop offset="0.28" stop-color="#ffd84d"/><stop offset="0.52" stop-color="#5ef0ff"/><stop offset="0.76" stop-color="#a78bfa"/><stop offset="1" stop-color="#ff5fa2"/></linearGradient></defs>
<rect width="200" height="240" fill="url(#bg)"/>
<path d="M-20 60 L220 0 M-20 130 L220 70 M-20 200 L220 140" stroke="#fff" stroke-opacity="0.35" stroke-width="14"/>
<rect x="4" y="4" width="192" height="232" rx="14" fill="none" stroke="#fde047" stroke-width="6"/>
<rect x="10" y="10" width="180" height="220" rx="10" fill="none" stroke="#fff" stroke-opacity="0.7" stroke-width="2"/>`;
  }
  return `<defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/></linearGradient></defs>
<rect width="200" height="240" fill="url(#bg)"/>`;
}

export function avatarSvg(t: Theme, staffIndex: number): string {
  const idx = Math.max(0, Math.min(5, staffIndex));
  const o = outfit(t.pattern, t, idx);
  const skin = SKIN[idx];
  const hair = HAIR[idx];
  const eyes =
    idx % 2 === 0
      ? `<ellipse cx="78" cy="118" rx="7" ry="9" fill="#111"/><ellipse cx="122" cy="118" rx="7" ry="9" fill="#111"/><circle cx="80" cy="115" r="2.5" fill="#fff"/><circle cx="124" cy="115" r="2.5" fill="#fff"/>`
      : `<path d="M68 120 q10 -12 20 0" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M112 120 q10 -12 20 0" stroke="#111" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const mouth = idx % 3 === 0 ? `<path d="M86 142 q14 14 28 0" stroke="#b45309" stroke-width="4" fill="#fff" stroke-linecap="round"/>` : `<path d="M88 144 q12 8 24 0" stroke="#b45309" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240">
${bgBlock(t)}
<circle cx="100" cy="110" r="84" fill="${t.accent}" opacity="0.18"/>
${o.body}
<rect x="88" y="140" width="24" height="30" fill="${skin}"/>
<circle cx="100" cy="112" r="50" fill="${skin}"/>
<ellipse cx="62" cy="122" rx="6" ry="9" fill="${skin}"/><ellipse cx="138" cy="122" rx="6" ry="9" fill="${skin}"/>
${hairShape(idx, hair)}
${o.head}
${eyes}
<circle cx="70" cy="136" r="7" fill="#fb7185" opacity="0.35"/><circle cx="130" cy="136" r="7" fill="#fb7185" opacity="0.35"/>
${mouth}
${o.front}
<circle cx="172" cy="28" r="18" fill="${t.accent}"/><text x="172" y="35" text-anchor="middle" font-size="20" font-weight="900" fill="#fff" font-family="sans-serif">${ROLE_GLYPH[idx]}</text>
</svg>`;
}
