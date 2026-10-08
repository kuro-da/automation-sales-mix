import { BUSINESSES, getBusiness, type Business } from "./businesses";
import { listWorldOverrides } from "./crm";

/** 設定画面で変更したワールド名（和名・事業名）を反映した事業定義（サーバー側専用）。 */
function apply(b: Business, ov: { title: string; name: string } | undefined): Business {
  if (!ov || (!ov.title && !ov.name)) return b;
  return { ...b, name: ov.name || b.name, theme: { ...b.theme, title: ov.title || b.theme.title } };
}

export function allWorlds(): Business[] {
  const ov = listWorldOverrides();
  return BUSINESSES.map((b) => apply(b, ov[b.id]));
}

export function getWorld(id: string): Business | undefined {
  const b = getBusiness(id);
  return b ? apply(b, listWorldOverrides()[id]) : undefined;
}
