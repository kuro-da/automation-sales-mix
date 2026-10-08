"use client";

import { useEffect, useMemo, useState } from "react";

type Id = "scout" | "analyzer" | "planner" | "writer" | "manager" | "reviewer";
interface Member {
  id: Id;
  name: string;
  role: string;
}
interface Props {
  members: Member[];
  working: Record<Id, string[]>;
  meeting: Record<Id, string[]>;
  agenda: { label: string; value: string; tone: "ok" | "warn" | "info" }[];
  accent: string;
  accent2: string;
  worldTitle: string;
}

// 席に着いているとき（%）。既存オフィスの初期位置を踏襲
const DESK: Record<Id, [number, number]> = {
  scout: [8, 84],
  analyzer: [22, 84],
  planner: [90, 80],
  writer: [91, 60],
  manager: [58, 86],
  reviewer: [76, 86],
};
// 会議テーブルの席
const SEAT: Record<Id, [number, number]> = {
  scout: [37, 44],
  analyzer: [50, 41],
  planner: [63, 44],
  writer: [37, 82],
  manager: [50, 85],
  reviewer: [63, 82],
};

const TONE = { ok: "text-emerald-700", warn: "text-amber-700", info: "text-slate-700" } as const;

export function MeetingRoom({ members, working, meeting, agenda, accent, accent2, worldTitle }: Props) {
  const [inMeeting, setInMeeting] = useState(false);
  const [night, setNight] = useState(false);
  const [talk, setTalk] = useState<Partial<Record<Id, string>>>({});
  const pools = useMemo(() => (inMeeting ? meeting : working), [inMeeting, meeting, working]);

  // 吹き出しを数秒ごとに入れ替える（クライアントのみ。ランダムなのでSSRでは出さない）
  useEffect(() => {
    const tick = () => {
      const ids = members.map((m) => m.id).sort(() => Math.random() - 0.5).slice(0, inMeeting ? 3 : 2);
      const next: Partial<Record<Id, string>> = {};
      for (const id of ids) {
        const pool = pools[id];
        next[id] = pool[Math.floor(Math.random() * pool.length)];
      }
      setTalk(next);
    };
    tick();
    const t = setInterval(tick, 3600);
    return () => clearInterval(t);
  }, [members, pools, inMeeting]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setInMeeting((v) => !v)}
          className="rounded-xl px-5 py-2.5 text-sm font-black text-white shadow-lg transition hover:scale-105"
          style={{ backgroundColor: accent }}
        >
          {inMeeting ? "席に戻る" : "全体会議を開く ▶"}
        </button>
        <button onClick={() => setNight((v) => !v)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">
          {night ? "☀ 昼にする" : "🌙 夜にする"}
        </button>
        <span className="text-xs text-slate-400">{inMeeting ? "AI社員が会議スペースに集まって、次のアクションを相談しています" : "AI社員がそれぞれの席で作業中です"}</span>
      </div>

      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/10" style={{ background: "linear-gradient(#f3ece3 0 38%, #e6cfb2 38% 100%)" }}>
        {/* 壁・窓 */}
        <div className="absolute inset-x-0 top-0 h-[38%]" style={{ backgroundImage: "linear-gradient(90deg, transparent 0 49.8%, #0000000d 49.8% 50.2%, transparent 50.2%)" }} />
        <div className="absolute left-[3%] top-[6%] h-[24%] w-[18%] rounded-lg border-4 border-white bg-gradient-to-b from-sky-200 to-sky-100 shadow-inner" />
        <div className="absolute right-[3%] top-[6%] h-[24%] w-[18%] rounded-lg border-4 border-white bg-gradient-to-b from-sky-200 to-sky-100 shadow-inner" />

        {/* ホワイトボード */}
        <div className="absolute left-[27%] top-[5%] h-[28%] w-[46%] rounded-xl border-[5px] border-slate-300 bg-white p-[1.2%] shadow-md">
          <div className="flex items-center justify-between">
            <div className="text-[clamp(8px,1.15vw,13px)] font-black" style={{ color: accent }}>本日の議題｜{worldTitle}</div>
          </div>
          <ul className="mt-[1%] grid grid-cols-2 gap-x-[4%] gap-y-[2%] sm:grid-cols-3">
            {agenda.map((a) => (
              <li key={a.label} className="flex items-baseline justify-between border-b border-dashed border-slate-200 text-[clamp(7px,1vw,12px)]">
                <span className="text-slate-500">{a.label}</span>
                <span className={`font-black ${TONE[a.tone]}`}>{a.value}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* ラグとテーブル */}
        <div className="absolute left-[24%] top-[40%] h-[52%] w-[52%] rounded-[40%] bg-[#f6ebdb] opacity-90 shadow-inner" />
        <div className="absolute left-[32%] top-[52%] h-[22%] w-[36%] rounded-2xl shadow-lg" style={{ background: "linear-gradient(#d19a68, #b97b4c)" }}>
          <div className="absolute left-1/2 top-1/2 h-[14%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded bg-[#f6efe8]/90" />
          <div className="absolute inset-x-0 -bottom-[10%] mx-auto h-[10%] w-[80%] rounded-b-xl bg-[#a96c40]/70" />
        </div>

        {/* 自席のデスク */}
        {members.map((m) => (
          <div
            key={`desk-${m.id}`}
            className="absolute h-[9%] w-[11%] -translate-x-1/2 rounded-md bg-[#c89060] shadow"
            style={{ left: `${DESK[m.id][0]}%`, top: `${DESK[m.id][1] + 5}%` }}
          >
            <div className="absolute -top-[55%] left-1/2 h-[60%] w-[46%] -translate-x-1/2 rounded-sm border-2 border-slate-600 bg-slate-800" />
          </div>
        ))}

        {/* 観葉植物 */}
        <div className="absolute bottom-[5%] left-[1.5%] h-[10%] w-[4%] rounded-full bg-emerald-600/80" />
        <div className="absolute bottom-[3%] right-[1.5%] h-[12%] w-[4.5%] rounded-full bg-emerald-700/80" />

        {/* AI社員 */}
        {members.map((m) => {
          const [x, y] = inMeeting ? SEAT[m.id] : DESK[m.id];
          const line = talk[m.id];
          return (
            <div
              key={m.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-all duration-[1400ms] ease-in-out"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              {line && (
                <div className={`absolute bottom-full z-20 mb-1 w-max max-w-[min(34vw,200px)] rounded-2xl ${x < 18 ? "left-[-20%]" : x > 82 ? "right-[-20%]" : "left-1/2 -translate-x-1/2"} border border-[#e7ddd3] bg-white/97 px-2.5 py-1.5 text-[clamp(8px,1vw,12px)] leading-snug text-slate-700 shadow-lg`} style={{ borderColor: `${accent}55` }}>
                  <b className="block text-[0.85em]" style={{ color: accent }}>{m.name}</b>
                  {line}
                  <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r bg-white" style={{ borderColor: `${accent}55` }} />
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/staff/${m.id}-portrait.png`}
                alt={m.name}
                className={`h-[clamp(40px,7vw,84px)] w-[clamp(40px,7vw,84px)] rounded-full border-[3px] bg-amber-50 object-cover shadow-lg ${inMeeting ? "" : "animate-pulse"}`}
                style={{ borderColor: accent2, objectPosition: "50% 30%", animationDuration: "3s" }}
              />
              <div className="mt-0.5 text-center text-[clamp(7px,0.9vw,11px)] font-black text-slate-800 [text-shadow:0_1px_0_#fff]">{m.name}</div>
            </div>
          );
        })}

        {night && <div className="pointer-events-none absolute inset-0 z-30 bg-indigo-950/55 mix-blend-multiply" />}
      </div>
    </div>
  );
}
