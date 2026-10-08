"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { seg: "", label: "🏢 オフィス" },
  { seg: "/leads", label: "📋 企業リスト" },
  { seg: "/tasks", label: "✅ タスク" },
  { seg: "/reports", label: "📊 レポート" },
  { seg: "/characters", label: "👥 キャラクター" },
  { seg: "/settings", label: "⚙️ 設定" },
];

export function WorldTabs({ id, accent }: { id: string; accent: string }) {
  const pathname = usePathname();
  const base = `/b/${id}`;
  return (
    <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
      {TABS.map((t) => {
        const href = base + t.seg;
        const active = t.seg === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={t.seg}
            href={href}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition ${active ? "text-white shadow" : "text-slate-600 hover:bg-slate-100"}`}
            style={active ? { backgroundColor: accent } : undefined}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
