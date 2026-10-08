import type { NextRequest } from "next/server";
import { listLeads } from "@/lib/crm";

export const runtime = "nodejs";

const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/** リードのCSV書き出し（Excel向けにBOM付きUTF-8）。事業で絞り込み可。 */
export async function GET(req: NextRequest) {
  const biz = req.nextUrl.searchParams.get("biz") ?? undefined;
  const rows = listLeads(biz ? { businessId: biz } : {});
  const head = ["事業", "会社名", "担当", "メール", "電話", "LINE", "流入元", "ステータス", "ステージ", "エリア", "業態", "ブランド", "ランク", "スコア", "根拠URL", "公式確認", "メモ"];
  const lines = rows.map((l) =>
    [l.businessId, l.company, l.contactName, l.email, l.phone, l.lineId, l.source, l.status, l.stage, l.meta.area, l.meta.type, l.meta.brand, l.meta.rank, l.meta.score, l.meta.sourceUrl, l.meta.verified === "no" ? "未確認" : "", l.notes]
      .map(esc)
      .join(","),
  );
  return new Response("﻿" + [head.map(esc).join(","), ...lines].join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="leads${biz ? "-" + biz : ""}.csv"` },
  });
}
