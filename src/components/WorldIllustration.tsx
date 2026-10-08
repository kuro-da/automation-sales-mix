import type { Theme } from "@/lib/businesses";

/**
 * ワールドのサムネイル用イラスト（すべてオリジナルのSVG）。
 * 既存作品のキャラクター・ロゴは使わず、モチーフ（市松・城壁・ピッチ・ネオン街・暖簾・炎）だけで物語を表現する。
 */
export function WorldIllustration({ t, className = "" }: { t: Theme; className?: string }) {
  const a = t.accent;
  const b = t.accent2;
  return (
    <svg viewBox="0 0 300 260" className={className} aria-hidden="true" preserveAspectRatio="xMaxYMid meet">
      {t.pattern === "ichimatsu" && <Ichimatsu a={a} b={b} />}
      {t.pattern === "walls" && <Walls a={a} b={b} />}
      {t.pattern === "slash" && <Striker a={a} b={b} />}
      {t.pattern === "neon" && <Neon a={a} b={b} />}
      {t.pattern === "holo" && <Seals a={a} b={b} />}
      {t.pattern === "lattice" && <Fortress a={a} b={b} />}
      {t.pattern === "lantern" && <Noren a={a} b={b} />}
      {t.pattern === "flame" && <Flame a={a} b={b} />}
    </svg>
  );
}

/** 市松ムダ退治隊：満月・竹林・市松の羽織の剣士のシルエットと、赤い一閃 */
function Ichimatsu({ a, b }: { a: string; b: string }) {
  return (
    <g>
      <circle cx="205" cy="78" r="56" fill={b} opacity="0.22" />
      <circle cx="205" cy="78" r="46" fill="#ecfccb" opacity="0.5" />
      {/* 竹 */}
      {[30, 62, 262].map((x, i) => (
        <g key={x} opacity={0.55 - i * 0.05}>
          <rect x={x} y="10" width="9" height="250" rx="4" fill="#14532d" />
          {[50, 100, 150, 200].map((y) => (
            <rect key={y} x={x - 2} y={y} width="13" height="4" rx="2" fill="#0a1a10" />
          ))}
        </g>
      ))}
      {/* 剣士のシルエット（市松の羽織） */}
      <g transform="translate(150 70)">
        <circle cx="0" cy="12" r="15" fill="#0b0f0c" />
        <path d="M-14 0 q14 -16 28 0 q2 -2 4 3 q-10 -6 -16 -3 q-8 -3 -16 3 q2 -5 0 -3z" fill="#0b0f0c" />
        <path d="M-32 36 L-20 28 L20 28 L36 38 L48 130 L-40 130 Z" fill="#0b0f0c" />
        <clipPath id="haori"><path d="M-32 36 L-20 28 L20 28 L36 38 L48 130 L-40 130 Z" /></clipPath>
        <g clipPath="url(#haori)">
          {Array.from({ length: 6 }).flatMap((_, r) =>
            Array.from({ length: 7 }).map((__, c) =>
              (r + c) % 2 === 0 ? <rect key={`${r}-${c}`} x={-44 + c * 14} y={28 + r * 17} width="14" height="17" fill="#16a34a" /> : null,
            ),
          )}
        </g>
        {/* 剣 */}
        <line x1="26" y1="44" x2="96" y2="-34" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
        <line x1="20" y1="50" x2="32" y2="40" stroke="#111" strokeWidth="6" strokeLinecap="round" />
      </g>
      {/* 赤い一閃 */}
      <path d="M96 190 Q180 120 262 30" stroke={a} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
      <path d="M96 190 Q180 120 262 30" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* 水の波紋 */}
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx="150" cy={236 + i * 6} rx={90 - i * 18} ry={7} fill="none" stroke={b} strokeOpacity="0.4" />
      ))}
    </g>
  );
}

/** 代理店開拓団：巨大な城壁と、その向こうをのぞく巨人のシルエット、翼の紋章の開拓者たち */
function Walls({ a, b }: { a: string; b: string }) {
  return (
    <g>
      {/* 巨人のシルエット */}
      <g fill="#1a1208" opacity="0.92">
        <circle cx="168" cy="92" r="42" />
        <path d="M110 150 q58 -52 118 0 L240 190 L96 190 Z" />
      </g>
      <g fill={a} opacity="0.85">
        <circle cx="152" cy="86" r="5" />
        <circle cx="186" cy="86" r="5" />
      </g>
      <path d="M150 114 q18 10 38 0" stroke={a} strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* 城壁 */}
      <rect x="0" y="168" width="300" height="92" fill="#3b2f20" />
      {[0, 1, 2].map((r) => (
        <g key={r} stroke="#1c1410" strokeOpacity="0.6" strokeWidth="2">
          <line x1="0" y1={188 + r * 24} x2="300" y2={188 + r * 24} />
          {Array.from({ length: 8 }).map((_, c) => (
            <line key={c} x1={(r % 2 ? 20 : 0) + c * 40} y1={168 + r * 24} x2={(r % 2 ? 20 : 0) + c * 40} y2={188 + r * 24} />
          ))}
        </g>
      ))}
      <rect x="0" y="162" width="300" height="9" fill="#52412a" />
      {/* 開拓者と翼の旗 */}
      <g transform="translate(228 112)">
        <line x1="0" y1="0" x2="0" y2="56" stroke="#a8a29e" strokeWidth="3" />
        <path d="M0 4 L34 12 L0 24 Z" fill={a} />
        <path d="M6 12 q8 -6 14 0 q-6 -2 -10 4 z" fill="#fff" opacity="0.9" />
      </g>
      {[40, 70, 100].map((x, i) => (
        <g key={x} transform={`translate(${x} ${150 - i * 2})`}>
          <circle cx="0" cy="0" r="7" fill="#0f0a05" />
          <path d="M-9 8 L9 8 L12 24 L-12 24 Z" fill="#14532d" />
          <path d="M-4 12 q4 -4 8 0" stroke={b} strokeWidth="1.5" fill="none" />
        </g>
      ))}
      {/* 空を飛ぶワイヤーの軌跡 */}
      <path d="M60 140 Q120 40 200 70" stroke={b} strokeOpacity="0.5" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
    </g>
  );
}

/** ブルーアリーナ：スポットライトの中、ボールを蹴るストライカーと電光の斜線 */
function Striker({ a, b }: { a: string; b: string }) {
  return (
    <g>
      <path d="M150 0 L250 260 L60 260 Z" fill={b} opacity="0.12" />
      <ellipse cx="160" cy="240" rx="110" ry="14" fill="none" stroke={b} strokeOpacity="0.5" />
      {[0, 1, 2, 3].map((i) => (
        <line key={i} x1={20 + i * 70} y1="260" x2={80 + i * 70} y2="40" stroke={a} strokeOpacity="0.35" strokeWidth="2" />
      ))}
      <text x="190" y="120" fontSize="120" fontWeight="900" fontStyle="italic" fill={a} opacity="0.22" fontFamily="Impact, Arial Black, sans-serif">1</text>
      {/* ストライカー */}
      <g transform="translate(140 40)" fill="#050b1f" stroke={b} strokeWidth="1.2" strokeOpacity="0.8">
        <circle cx="10" cy="14" r="13" />
        <path d="M-12 30 L28 26 L40 70 L18 84 L24 116 L4 120 L-4 84 L-16 74 Z" />
        <path d="M18 84 L58 112 L52 124 L10 100 Z" />
        <path d="M-4 84 L-30 126 L-18 134 L8 98 Z" />
        <path d="M28 30 L62 8 L68 18 L36 46 Z" />
        <path d="M-12 32 L-40 46 L-36 58 L-6 46 Z" />
      </g>
      <circle cx="226" cy="150" r="14" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <path d="M226 142 l6 4 l-2 8 h-8 l-2 -8z" fill="#0f172a" />
      <path d="M170 160 L215 152 M165 172 L212 160" stroke={b} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      {/* 電光のライン */}
      <path d="M40 90 L84 60 L70 100 L120 70" stroke={b} strokeWidth="3" fill="none" strokeLinejoin="round" />
    </g>
  );
}

/** ネオン・コード：夜のビル群と電脳の太陽、遠近グリッド */
function Neon({ a, b }: { a: string; b: string }) {
  const bars = [
    [20, 110, 40], [66, 70, 36], [108, 130, 44], [158, 90, 34], [198, 50, 46], [250, 100, 38],
  ];
  return (
    <g>
      <circle cx="170" cy="100" r="62" fill="none" stroke={b} strokeWidth="2" opacity="0.7" />
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} x1="112" y1={78 + i * 11} x2="228" y2={78 + i * 11} stroke={b} strokeWidth={2 + i * 0.6} opacity="0.45" />
      ))}
      {bars.map(([x, y, w], i) => (
        <g key={i}>
          <rect x={x} y={y + 40} width={w} height={260 - y - 40} fill="#0b0626" stroke={i % 2 ? a : b} strokeWidth="1.5" />
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 2 }).map((__, c) => ((r * 3 + c * 5 + i) % 3 ? <rect key={`${r}${c}`} x={x + 6 + c * (w / 2.2)} y={y + 52 + r * 14} width="6" height="6" fill={i % 2 ? a : b} opacity="0.8" /> : null)),
          )}
        </g>
      ))}
      {/* 遠近グリッド */}
      <g stroke={a} strokeOpacity="0.5">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={i} x1={150} y1="205" x2={-30 + i * 45} y2="260" />
        ))}
        {[212, 222, 236, 254].map((y) => (
          <line key={y} x1="0" y1={y} x2="300" y2={y} />
        ))}
      </g>
      <text x="26" y="52" fontSize="22" fontWeight="700" fill={b} opacity="0.85" fontFamily="monospace">{"</sales>"}</text>
    </g>
  );
}

/** キラキラ・シール王国：虹色ホログラムのシールカードが扇状に並ぶ（天使・悪魔・お守りのオリジナルキャラ） */
function Seals({ a, b }: { a: string; b: string }) {
  const foil = (id: string) => (
    <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#ff5fa2" />
      <stop offset="0.25" stopColor="#ffd84d" />
      <stop offset="0.5" stopColor="#5ef0ff" />
      <stop offset="0.75" stopColor="#a78bfa" />
      <stop offset="1" stopColor="#ff5fa2" />
    </linearGradient>
  );
  const card = (x: number, y: number, rot: number, kind: "angel" | "devil" | "charm", id: string) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x="-48" y="-68" width="96" height="136" rx="9" fill={`url(#${id})`} stroke="#fde047" strokeWidth="4" />
      <rect x="-42" y="-62" width="84" height="124" rx="6" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.5" />
      {/* 光の筋 */}
      <path d="M-40 -20 L40 -50 M-40 10 L40 -20 M-40 40 L40 10" stroke="#fff" strokeOpacity="0.35" strokeWidth="6" />
      {/* キャラ */}
      {kind === "angel" && (
        <g>
          <path d="M-8 4 Q-52 -22 -46 20 Q-30 6 -12 18Z" fill="#fff" />
          <path d="M8 4 Q52 -22 46 20 Q30 6 12 18Z" fill="#fff" />
          <circle cx="0" cy="8" r="20" fill="#ffe3c2" />
          <ellipse cx="0" cy="-20" rx="14" ry="4" fill="none" stroke="#fde047" strokeWidth="3" />
          <circle cx="-7" cy="8" r="3" fill="#222" /><circle cx="7" cy="8" r="3" fill="#222" />
          <path d="M-6 16 q6 6 12 0" stroke="#c2410c" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M-18 26 L18 26 L22 52 L-22 52Z" fill="#fff" />
        </g>
      )}
      {kind === "devil" && (
        <g>
          <path d="M-22 -4 L-30 -28 L-10 -12Z M22 -4 L30 -28 L10 -12Z" fill="#7f1d1d" />
          <circle cx="0" cy="8" r="20" fill="#ffd2b0" />
          <path d="M-9 4 l6 4 M9 4 l-6 4" stroke="#222" strokeWidth="3" strokeLinecap="round" />
          <path d="M-8 18 q8 -8 16 0" stroke="#7f1d1d" strokeWidth="3" fill="#fff" strokeLinecap="round" />
          <path d="M-18 26 L18 26 L22 52 L-22 52Z" fill="#4c1d95" />
          <path d="M22 40 q22 6 24 -14" stroke="#7f1d1d" strokeWidth="3" fill="none" />
        </g>
      )}
      {kind === "charm" && (
        <g>
          <path d="M0 -34 L28 -22 L24 16 Q18 40 0 50 Q-18 40 -24 16 L-28 -22Z" fill="#fde047" stroke="#b45309" strokeWidth="3" />
          <path d="M0 -20 L14 -14 L12 12 Q8 26 0 32 Q-8 26 -12 12 L-14 -14Z" fill={a} />
          <text x="0" y="12" textAnchor="middle" fontSize="26" fontWeight="900" fill="#fff" fontFamily="serif">守</text>
        </g>
      )}
      {/* 名札 */}
      <rect x="-40" y="52" width="80" height="12" rx="3" fill="#1e1b4b" opacity="0.85" />
      <rect x="-40" y="-64" width="26" height="12" rx="3" fill={a} />
    </g>
  );
  const sparkle = (x: number, y: number, s: number) => (
    <path key={`${x}${y}`} transform={`translate(${x} ${y}) scale(${s})`} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2Z" fill="#fff" />
  );
  return (
    <g>
      <defs>{foil("f1")}{foil("f2")}{foil("f3")}</defs>
      {card(88, 140, -14, "devil", "f1")}
      {card(214, 140, 14, "charm", "f3")}
      {card(150, 128, 0, "angel", "f2")}
      {sparkle(40, 40, 1.4)}{sparkle(262, 34, 1.1)}{sparkle(236, 214, 1.3)}{sparkle(60, 224, 0.9)}{sparkle(150, 30, 1)}
      <text x="150" y="238" textAnchor="middle" fontSize="20" fontWeight="900" fontStyle="italic" fill={b} stroke="#7c1d6f" strokeWidth="1" fontFamily="Impact, Arial Black, sans-serif">ALL GET!</text>
    </g>
  );
}

/** 天下開拓陣：城塞と軍旗、夕焼けの大地 */
function Fortress({ a, b }: { a: string; b: string }) {
  return (
    <g>
      <circle cx="220" cy="70" r="40" fill={b} opacity="0.35" />
      <path d="M0 200 Q80 170 150 190 T300 180 L300 260 L0 260Z" fill="#2a0a0a" />
      <g fill="#1c0707" stroke={b} strokeOpacity="0.5">
        <rect x="90" y="120" width="120" height="90" />
        <path d="M80 120 h140 l-10 -16 h-120z" />
        {[96, 120, 144, 168, 192].map((x) => (
          <rect key={x} x={x} y="108" width="12" height="12" />
        ))}
        <path d="M130 210 v-40 a20 20 0 0 1 40 0 v40z" fill="#0a0303" />
      </g>
      {[40, 250].map((x) => (
        <g key={x} transform={`translate(${x} 90)`}>
          <line x1="0" y1="0" x2="0" y2="120" stroke="#a8a29e" strokeWidth="3" />
          <path d="M0 4 L40 14 L0 30Z" fill={a} />
          <circle cx="16" cy="16" r="4" fill={b} />
        </g>
      ))}
    </g>
  );
}

/** のれん街道：吊るし提灯と暖簾、徳利と盃 */
function Noren({ a, b }: { a: string; b: string }) {
  return (
    <g>
      <line x1="0" y1="26" x2="300" y2="40" stroke="#fde68a" strokeOpacity="0.5" strokeWidth="2" />
      {[30, 100, 170, 240].map((x, i) => (
        <g key={x} transform={`translate(${x} ${i % 2 ? 54 : 46})`}>
          <line x1="0" y1="-16" x2="0" y2="0" stroke="#fde68a" strokeOpacity="0.6" />
          <ellipse cx="0" cy="22" rx="20" ry="26" fill={a} />
          <ellipse cx="0" cy="22" rx="20" ry="26" fill="url(#glow)" opacity="0.4" />
          {[8, 16, 24, 32].map((y) => (
            <path key={y} d={`M-18 ${y} Q0 ${y + 5} 18 ${y}`} stroke="#7c2d12" strokeOpacity="0.5" fill="none" />
          ))}
          <rect x="-8" y="-2" width="16" height="6" fill="#7c2d12" />
          <rect x="-8" y="46" width="16" height="6" fill="#7c2d12" />
          <text x="0" y="28" textAnchor="middle" fontSize="16" fontWeight="900" fill="#fff7ed" fontFamily="serif">{["酒", "宴", "肴", "縁"][i]}</text>
        </g>
      ))}
      <defs>
        <radialGradient id="glow"><stop offset="0" stopColor="#fff" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      {/* 暖簾 */}
      <g transform="translate(60 150)">
        <rect x="0" y="0" width="190" height="8" fill="#451a03" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${i * 47 + 2} 8 H${i * 47 + 45} V92 L${i * 47 + 23} 80 L${i * 47 + 2} 92 Z`} fill={i % 2 ? "#7c2d12" : "#9a3412"} />
        ))}
        <text x="95" y="62" textAnchor="middle" fontSize="38" fontWeight="900" fill="#fde68a" fontFamily="serif" opacity="0.9">宴</text>
      </g>
      {/* 徳利と盃 */}
      <g transform="translate(236 214)">
        <path d="M0 0 q-6 -16 0 -26 h8 q6 10 0 26 z" fill="#f8fafc" opacity="0.9" />
        <rect x="1" y="-34" width="6" height="9" fill="#f8fafc" opacity="0.9" />
        <path d="M-30 0 h24 l-3 12 h-18 z" fill={b} opacity="0.9" />
      </g>
    </g>
  );
}

/** とことんアリーナ：燃え上がる炎と、骨付き肉のシルエット、金の王冠 */
function Flame({ a, b }: { a: string; b: string }) {
  return (
    <g>
      {[
        { x: 60, h: 140, w: 60 },
        { x: 120, h: 190, w: 80 },
        { x: 200, h: 150, w: 64 },
      ].map((f, i) => (
        <path
          key={i}
          d={`M${f.x} 260 C${f.x - f.w / 2} ${260 - f.h * 0.4} ${f.x - f.w / 4} ${260 - f.h * 0.7} ${f.x} ${260 - f.h} C${f.x + f.w / 4} ${260 - f.h * 0.7} ${f.x + f.w / 2} ${260 - f.h * 0.4} ${f.x + f.w * 0.1} 260 Z`}
          fill={i === 1 ? b : a}
          opacity="0.75"
        />
      ))}
      <path d="M130 260 C112 220 122 190 132 170 C142 192 156 214 150 260 Z" fill="#fde68a" opacity="0.85" />
      {/* 骨付き肉 */}
      <g transform="translate(150 70) rotate(-18)">
        <ellipse cx="0" cy="0" rx="58" ry="42" fill="#7f1d1d" stroke="#fecaca" strokeWidth="2" />
        <ellipse cx="-8" cy="-6" rx="34" ry="22" fill="#b91c1c" />
        <path d="M-30 -14 q20 -16 44 -4" stroke="#fecaca" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.7" />
        <rect x="52" y="-8" width="62" height="16" rx="8" fill="#f8fafc" />
        <circle cx="116" cy="-10" r="10" fill="#f8fafc" />
        <circle cx="116" cy="10" r="10" fill="#f8fafc" />
      </g>
      {/* 王冠 */}
      <g transform="translate(120 6)" fill={b}>
        <path d="M0 40 L6 8 L20 28 L34 0 L48 28 L62 8 L68 40 Z" />
        <rect x="0" y="40" width="68" height="8" rx="2" />
      </g>
    </g>
  );
}
