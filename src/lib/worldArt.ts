import type { CSSProperties } from "react";
import type { Theme } from "./businesses";

/** ワールドごとの背景。画像素材を使わず、グラデーションとSVGだけで描く（オリジナル）。 */
function svg(body: string, w: number, h: number): string {
  const s = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>${body}</svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(s)}")`;
}

export function worldBackground(t: Theme): CSSProperties {
  const base = `linear-gradient(135deg, ${t.from}, ${t.to})`;
  switch (t.pattern) {
    case "walls": {
      // 石積みの城壁
      const bricks = svg(
        `<g fill='none' stroke='${t.accent2}' stroke-opacity='.16' stroke-width='2'>
          <path d='M0 30h120M0 60h120M0 90h120M60 0v30M0 30v30M120 30v30M60 60v30M0 90v30M120 90v30'/>
        </g>`,
        120,
        120,
      );
      return {
        backgroundImage: `radial-gradient(ellipse at 50% 120%, ${t.accent}55, transparent 60%), ${bricks}, ${base}`,
      };
    }
    case "slash":
      return {
        backgroundImage: `repeating-linear-gradient(115deg, transparent 0 34px, ${t.accent2}14 34px 37px), linear-gradient(115deg, transparent 52%, ${t.accent}55 52% 54%, transparent 54%), radial-gradient(circle at 85% 15%, ${t.accent}66, transparent 45%), ${base}`,
      };
    case "grid":
      return {
        backgroundImage: `linear-gradient(${t.accent2}14 1px, transparent 1px), linear-gradient(90deg, ${t.accent2}14 1px, transparent 1px), radial-gradient(circle at 80% 10%, ${t.accent}55, transparent 50%), ${base}`,
        backgroundSize: "36px 36px, 36px 36px, auto, auto",
      };
    case "neon":
      return {
        backgroundImage: `repeating-linear-gradient(0deg, ${t.accent}12 0 1px, transparent 1px 5px), linear-gradient(90deg, ${t.accent2}18 1px, transparent 1px), radial-gradient(circle at 20% 90%, ${t.accent2}55, transparent 45%), radial-gradient(circle at 85% 10%, ${t.accent}55, transparent 45%), ${base}`,
        backgroundSize: "auto, 48px 48px, auto, auto, auto",
      };
    case "lantern": {
      const lamps = svg(
        `<g><circle cx='40' cy='34' r='15' fill='${t.accent}' fill-opacity='.55'/><rect x='34' y='16' width='12' height='5' fill='${t.accent2}' fill-opacity='.5'/>
         <circle cx='120' cy='54' r='11' fill='${t.accent}' fill-opacity='.35'/><rect x='115' y='40' width='10' height='4' fill='${t.accent2}' fill-opacity='.4'/></g>`,
        160,
        90,
      );
      return {
        backgroundImage: `${lamps}, radial-gradient(ellipse at 50% 110%, ${t.accent}55, transparent 60%), ${base}`,
        backgroundRepeat: "repeat-x, no-repeat, no-repeat",
        backgroundPosition: "0 0, center, center",
      };
    }
    case "ichimatsu":
      // 市松模様（緑×黒）と青海波風の波紋。上に暗いグラデーションを重ねて文字を読みやすくする
      return {
        backgroundImage: `radial-gradient(ellipse at 85% 0%, ${t.accent}44, transparent 50%), linear-gradient(135deg, ${t.from}e6, ${t.to}99), radial-gradient(circle at 50% 100%, transparent 0 16px, #ffffff12 17px 19px, transparent 20px), conic-gradient(from 90deg at 50% 50%, #0a1a10 25%, #15803d 0 50%, #0a1a10 0 75%, #15803d 0)`,
        backgroundSize: "auto, auto, 40px 20px, 64px 64px",
      };
    case "holo":
      // ホログラムのシール：虹色のプリズム斜線＋キラキラの粒＋金のきらめき
      return {
        backgroundImage: `radial-gradient(circle at 20% 30%, #ffffff55 0 2px, transparent 3px), radial-gradient(circle at 70% 70%, #fde04788 0 2px, transparent 3px), radial-gradient(circle at 85% 20%, #ffffff66 0 1.5px, transparent 2.5px), repeating-linear-gradient(115deg, #ff2d7a30 0 18px, #ffd60030 18px 36px, #00e5ff30 36px 54px, #7c4dff30 54px 72px), linear-gradient(135deg, ${t.from}, ${t.to})`,
        backgroundSize: "46px 46px, 62px 62px, 38px 38px, auto, auto",
      };
    case "lattice": {
      // 中華風の格子紋と軍旗の赤。金の細線で斜め格子を描く
      return {
        backgroundImage: `radial-gradient(ellipse at 85% 0%, ${t.accent}66, transparent 55%), repeating-linear-gradient(45deg, transparent 0 22px, ${t.accent2}18 22px 23px), repeating-linear-gradient(-45deg, transparent 0 22px, ${t.accent2}18 22px 23px), linear-gradient(135deg, ${t.from}, ${t.to})`,
      };
    }
    case "flame":
      return {
        backgroundImage: `radial-gradient(ellipse at 50% 130%, ${t.accent2}99, transparent 55%), radial-gradient(ellipse at 20% 120%, ${t.accent}aa, transparent 50%), repeating-linear-gradient(60deg, transparent 0 40px, ${t.accent2}10 40px 42px), ${base}`,
      };
  }
}

export function worldFont(t: Theme): CSSProperties {
  if (t.font === "serif") return { fontFamily: "'Hiragino Mincho ProN','Yu Mincho','MS PMincho',serif", fontWeight: 900, letterSpacing: "0.04em" };
  if (t.font === "display") return { fontFamily: "Impact,'Arial Black','Hiragino Kaku Gothic ProN',sans-serif", fontWeight: 900, fontStyle: "italic", letterSpacing: "0.03em" };
  return { fontFamily: "'Segoe UI','Hiragino Kaku Gothic ProN',Meiryo,sans-serif", fontWeight: 800, letterSpacing: "0.06em" };
}
