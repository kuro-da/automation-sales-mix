// assets/originals の元画像（無加工）から、取り込み用コピーを assets/import に作る。
// キャラ: 1024x1024（縦横比を保って余白で収める） / サムネイル: 幅1600。元画像は変更しない。
// 使い方: node scripts/make-import-copies.mjs
import sharp from "sharp";
import { mkdirSync, readdirSync, statSync } from "node:fs";

mkdirSync("assets/import", { recursive: true });
for (const f of readdirSync("assets/originals").filter((x) => x.endsWith(".png"))) {
  const thumb = f.endsWith("_thumb.png");
  const resize = thumb ? { width: 1600 } : { width: 1024, height: 1024, fit: "contain", background: "#000" };
  const out = `assets/import/${f}`;
  await sharp(`assets/originals/${f}`).resize(resize).png({ compressionLevel: 9 }).toFile(out);
  let size = statSync(out).size;
  const limit = (thumb ? 5 : 3) * 1024 * 1024;
  if (size > limit) {
    await sharp(`assets/originals/${f}`).resize(resize).png({ palette: true, quality: 90, compressionLevel: 9 }).toFile(out);
    size = statSync(out).size;
  }
  console.log(f, (size / 1024 / 1024).toFixed(2) + "MB", size > limit ? "OVER" : "ok");
}
