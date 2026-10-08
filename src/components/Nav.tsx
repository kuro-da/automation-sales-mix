"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const COACH = ["/coach", "/roleplay", "/consult", "/script-review", "/history"];

const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const MAIN: { href: string; label: string; icon: ReactNode; match: (p: string) => boolean }[] = [
  { href: "/", label: "ワールド選択", icon: <Icon d="M12 2l3 7 7 .8-5.3 4.7 1.6 7.2L12 18l-6.3 3.7 1.6-7.2L2 9.8 9 9z" />, match: (p) => p === "/" || p.startsWith("/b/") },
  { href: "/dashboard", label: "ダッシュボード", icon: <Icon d="M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10" />, match: (p) => p.startsWith("/dashboard") },
  { href: "/leads", label: "リード", icon: <Icon d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8" />, match: (p) => p.startsWith("/leads") },
  { href: "/outbox", label: "配信キュー", icon: <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />, match: (p) => p.startsWith("/outbox") },
  { href: "/automation", label: "自動化フロー", icon: <Icon d="M4 4h6v6H4zM14 14h6v6h-6zM10 7h4a3 3 0 013 3v4" />, match: (p) => p.startsWith("/automation") },
  { href: "/import-art", label: "画像一括取込", icon: <Icon d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />, match: (p) => p.startsWith("/import-art") },
  { href: "/integrations", label: "連携設定", icon: <Icon d="M10 13a5 5 0 007 0l3-3a5 5 0 00-7-7l-1 1M14 11a5 5 0 00-7 0l-3 3a5 5 0 007 7l1-1" />, match: (p) => p.startsWith("/integrations") },
];

const COACH_LINKS: [string, string][] = [
  ["/coach", "コーチ ホーム"],
  ["/roleplay", "ロープレ"],
  ["/consult", "営業相談（壁打ち）"],
  ["/script-review", "スクリプト添削"],
  ["/history", "振り返り"],
];

export function Nav({ businesses }: { businesses: { id: string; short: string; name: string; hex: string }[] }) {
  const pathname = usePathname();
  const inCoach = COACH.some((c) => pathname.startsWith(c));

  const item = (active: boolean) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
      active ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"
    }`;

  return (
    <aside className="flex flex-col bg-slate-900 text-slate-300 lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:overflow-y-auto">
      <Link href="/" className="flex items-center gap-3 px-5 py-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-violet-500 text-sm font-black text-white shadow-lg shadow-brand-900/40">MB</span>
        <span className="leading-tight">
          <span className="block text-sm font-bold text-white">営業ポータル</span>
          <span className="block text-[11px] text-slate-500">MEDIA BRAIN</span>
        </span>
      </Link>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible">
        {MAIN.map((l) => (
          <Link key={l.href} href={l.href} className={`${item(l.match(pathname))} whitespace-nowrap`}>
            {l.icon}
            {l.label}
          </Link>
        ))}
        <Link href="/coach" className={`${item(inCoach)} whitespace-nowrap`}>
          <Icon d="M12 2a7 7 0 00-4 12.7V18h8v-3.3A7 7 0 0012 2zM9 21h6" />
          営業コーチAI
        </Link>
        {inCoach && (
          <div className="hidden space-y-0.5 border-l border-white/10 pl-3 lg:ml-5 lg:block">
            {COACH_LINKS.map(([href, label]) => (
              <Link key={href} href={href} className={`block rounded px-2 py-1 text-xs ${pathname.startsWith(href) && (href !== "/coach" || pathname === "/coach") ? "font-semibold text-white" : "text-slate-500 hover:text-slate-200"}`}>
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="hidden px-5 pb-6 pt-3 lg:block">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">事業</div>
        <ul className="space-y-0.5">
          {businesses.map((b) => (
            <li key={b.id}>
              <Link href={`/b/${b.id}`} className={`flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] transition ${pathname === `/b/${b.id}` ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"}`}>
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: b.hex }} />
                {b.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
