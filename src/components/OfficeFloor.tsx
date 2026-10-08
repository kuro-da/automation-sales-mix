"use client";

import { useEffect, useRef, useState } from "react";

export interface Member {
  key: string;
  name: string;
  role: string;
  tagline: string;
  rarity: "SSR" | "SR";
  move: string;
  stage: string;
  task: string;
  skills: { name: string; level: number }[];
  portrait: string;
  card: string;
  custom: boolean;
  work: string[];
  meet: string[];
  act: string;
}

interface Props {
  members: Member[];
  leadNames: string[]; // 実際のリード名。作業中のセリフに使う
  goals: { label: string; done: boolean }[];
  agenda: { label: string; value: string; tone: "ok" | "warn" | "info" }[];
  hud: { rank: string; level: number; xp: number; xpNext: number; progress: number; streak: number; power: number };
  quest: { name: string; prospect: [number, number]; deal: [number, number] };
  logo: { title: string; sub: string };
  accent: string;
  accent2: string;
}

// 自席（%）。既存オフィスの配置を踏襲し、7人目以降は追加席
const DESKS: [number, number][] = [
  [8, 80], [22, 80], [90, 76], [91, 56], [58, 82], [76, 82],
  [36, 80], [67, 80], [8, 62], [91, 38],
];
// 会議テーブルの席
const SEATS: [number, number][] = [
  [38, 44], [50, 41], [62, 44], [38, 78], [50, 81], [62, 78],
  [28, 56], [72, 56], [28, 68], [72, 68],
];
const LOUNGE: [number, number][] = [[17, 50], [18, 58], [13, 54]];

const TONE = { ok: "text-emerald-700", warn: "text-amber-700", info: "text-slate-700" } as const;
type Cam = "default" | "top" | "close";
type Mode = "work" | "handoff" | "coffee" | "idle" | "meet";

const MODE_LABEL: Record<Mode, string> = { work: "作業中", handoff: "引き継ぎ", coffee: "休憩", idle: "待機", meet: "会議中" };
const MODE_CLS: Record<Mode, string> = {
  work: "bg-emerald-500 text-white",
  handoff: "bg-sky-500 text-white",
  coffee: "bg-amber-400 text-amber-950",
  idle: "bg-slate-200 text-slate-600",
  meet: "bg-violet-500 text-white",
};

export function OfficeFloor({ members, leadNames, goals, agenda, hud, quest, logo, accent, accent2 }: Props) {
  const n = members.length;
  const [inMeeting, setInMeeting] = useState(false);
  const [night, setNight] = useState(false);
  const [cam, setCam] = useState<Cam>("default");
  const [selKey, setSelKey] = useState(members[0].key);
  const [step, setStep] = useState(0);
  const [moving, setMoving] = useState<Set<string>>(new Set());
  const [meetTalk, setMeetTalk] = useState<Record<string, string>>({});
  const [popStep, setPopStep] = useState(-1);
  const prevPos = useRef<Record<string, string>>({});

  const me = members.find((m) => m.key === selKey) ?? members[0];

  // 仕事のサイクル：担当が順に作業 → 次の担当へ引き継ぎ → ときどき休憩。数秒ごとに進む。
  useEffect(() => {
    if (inMeeting) return;
    const t = setInterval(() => setStep((s) => s + 1), 4200);
    return () => clearInterval(t);
  }, [inMeeting]);

  const holder = step % n;
  const prev = (holder - 1 + n) % n;
  let coffee = step % 3 === 0 && n > 3 ? (holder + 3) % n : -1;
  if (coffee === prev || coffee === holder) coffee = n > 4 ? (holder + 4) % n : -1;
  const lead = leadNames.length > 0 ? leadNames[step % leadNames.length] : "新規リード";

  const modeOf = (i: number): Mode => {
    if (inMeeting) return "meet";
    if (i === holder) return "work";
    if (i === prev && step > 0) return "handoff";
    if (i === coffee) return "coffee";
    return "idle";
  };
  const posOf = (i: number): [number, number] => {
    const m = modeOf(i);
    if (m === "meet") return SEATS[i];
    if (m === "handoff") {
      const [hx, hy] = DESKS[holder];
      return [hx + (hx < 50 ? 8 : -8), hy];
    }
    if (m === "coffee") return LOUNGE[i % LOUNGE.length];
    return DESKS[i];
  };

  // 位置が変わったメンバーは「歩いている」アニメーションにする
  useEffect(() => {
    const now: Record<string, string> = {};
    const mv = new Set<string>();
    members.forEach((m, i) => {
      const p = posOf(i).join(",");
      now[m.key] = p;
      if (prevPos.current[m.key] && prevPos.current[m.key] !== p) mv.add(m.key);
    });
    prevPos.current = now;
    setMoving(mv);
    const t = setTimeout(() => setMoving(new Set()), 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, inMeeting]);

  // 最終確認が終わったタイミングで完了の演出
  useEffect(() => {
    if (!inMeeting && holder === n - 1 && step > 0) {
      setPopStep(step);
      const t = setTimeout(() => setPopStep(-1), 2400);
      return () => clearTimeout(t);
    }
  }, [step, inMeeting, holder, n]);

  // 会議中は吹き出しをランダムに入れ替える
  useEffect(() => {
    if (!inMeeting) return;
    const tick = () => {
      const next: Record<string, string> = {};
      [...members].sort(() => Math.random() - 0.5).slice(0, 3).forEach((m) => {
        next[m.key] = m.meet[Math.floor(Math.random() * m.meet.length)];
      });
      setMeetTalk(next);
    };
    tick();
    const t = setInterval(tick, 3400);
    return () => clearInterval(t);
  }, [inMeeting, members]);

  const lineOf = (i: number): string | undefined => {
    const m = members[i];
    if (inMeeting) return meetTalk[m.key];
    const md = modeOf(i);
    if (md === "work") return m.act.replace("{lead}", lead);
    if (md === "handoff") return `${members[holder].name}さん、「${lead}」お願いします！`;
    if (md === "coffee") return "ちょっと休憩☕";
    return undefined;
  };

  const camStyle =
    cam === "top"
      ? { transform: "perspective(1400px) rotateX(16deg) scale(.95)", transformOrigin: "50% 100%" }
      : cam === "close"
        ? { transform: "scale(1.28)", transformOrigin: "50% 85%" }
        : { transform: "none" };
  const btn = (on: boolean) => `rounded-lg px-3 py-1.5 text-xs font-bold transition ${on ? "text-white" : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"}`;
  const [fx, fy] = DESKS[prev];
  const [tx, ty] = DESKS[holder];

  return (
    <div className="space-y-4">
      {/* GAME HUD */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[auto_1fr_auto_auto]">
        <HudCard label="TEAM RANK">
          <div className="text-4xl font-black leading-none" style={{ color: accent }}>{hud.rank}</div>
          <div className="mt-1 text-[11px] text-slate-500">TEAM Lv.{hud.level}</div>
        </HudCard>
        <HudCard label="TEAM EXPERIENCE">
          <div className="text-lg font-black text-slate-900">{hud.xp.toLocaleString()} / {hud.xpNext.toLocaleString()} XP</div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full" style={{ width: `${Math.max(4, hud.progress)}%`, background: `linear-gradient(90deg, ${accent}, ${accent2})` }} />
          </div>
        </HudCard>
        <HudCard label="AP STREAK">
          <div className="text-xl font-black text-slate-900">{hud.streak} COMBO</div>
          <div className="text-[11px] text-slate-500">連続営業日</div>
        </HudCard>
        <HudCard label="TEAM POWER">
          <div className="text-xl font-black text-slate-900">{hud.power.toLocaleString()}</div>
          <div className="text-[11px] text-slate-500">営業戦闘力</div>
        </HudCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <button onClick={() => setInMeeting((v) => !v)} className={btn(inMeeting)} style={inMeeting ? { backgroundColor: accent } : undefined}>
              {inMeeting ? "席に戻る" : "会議"}
            </button>
            {(["top", "close", "default"] as Cam[]).map((c) => (
              <button key={c} onClick={() => setCam(c)} className={btn(cam === c)} style={cam === c ? { backgroundColor: "#334155" } : undefined}>
                {c === "top" ? "俯瞰" : c === "close" ? "近景" : "標準"}
              </button>
            ))}
            <button onClick={() => setNight((v) => !v)} className={btn(night)} style={night ? { backgroundColor: "#312e81" } : undefined}>
              {night ? "☀ 昼" : "🌙 夜"}
            </button>
            <span className="ml-auto text-[11px] text-slate-400">{inMeeting ? "全体会議中：次のアクションを相談しています" : "クリックでAI社員のプロフィールを表示"}</span>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/10">
            <div className="relative aspect-[16/10] w-full transition-transform duration-700" style={{ background: "linear-gradient(#f3ece3 0 36%, #e6cfb2 36% 100%)", ...camStyle }}>
              {/* 壁 */}
              <div className="absolute left-[2.5%] top-[4%] h-[27%] w-[19%] rounded-xl bg-white/70 p-[1.2%] shadow">
                <div className="text-[clamp(8px,1.25vw,15px)] font-black leading-tight" style={{ color: accent }}>{logo.title}</div>
                <div className="text-[clamp(6px,0.75vw,9px)] tracking-widest text-slate-400">{logo.sub}</div>
              </div>
              <div className="absolute left-[24%] top-[4%] h-[27%] w-[34%] rounded-xl border-[5px] border-slate-300 bg-white p-[1.2%] shadow-md">
                <div className="text-[clamp(8px,1.1vw,13px)] font-black" style={{ color: accent }}>{inMeeting ? "本日の議題" : "今週の目標"}</div>
                <ul className="mt-[1%] grid grid-cols-2 gap-x-[4%] gap-y-[1%] text-[clamp(7px,0.95vw,12px)]">
                  {inMeeting
                    ? agenda.map((a) => (
                        <li key={a.label} className="flex justify-between border-b border-dashed border-slate-200">
                          <span className="text-slate-500">{a.label}</span>
                          <span className={`font-black ${TONE[a.tone]}`}>{a.value}</span>
                        </li>
                      ))
                    : goals.map((g) => (
                        <li key={g.label} className={g.done ? "font-bold text-emerald-700" : "text-slate-600"}>
                          {g.done ? "✓" : "□"} {g.label}
                        </li>
                      ))}
                </ul>
              </div>
              <div className="absolute right-[2.5%] top-[4%] h-[27%] w-[36%] rounded-xl bg-gradient-to-b from-sky-200 to-sky-100 shadow-inner" style={{ border: "5px solid #fff" }} />

              {/* 作業中バナー（既存の work-banner） */}
              {!inMeeting && (
                <div className="absolute right-[4%] top-[6%] z-20 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[clamp(8px,1vw,12px)] font-bold text-slate-700 shadow">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                  作業中｜{members[holder].name}：{members[holder].role}
                </div>
              )}

              {/* ラグ・会議テーブル・ラウンジ */}
              <div className="absolute left-[24%] top-[38%] h-[52%] w-[52%] rounded-[40%] bg-[#f6ebdb] opacity-90 shadow-inner" />
              <div className="absolute left-[32%] top-[50%] h-[22%] w-[36%] rounded-2xl shadow-lg" style={{ background: "linear-gradient(#d19a68, #b97b4c)" }}>
                <div className="absolute left-1/2 top-1/2 h-[14%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded bg-[#f6efe8]/90" />
              </div>
              <div className="absolute left-[34%] top-[36%] text-[clamp(6px,0.8vw,10px)] font-bold tracking-widest text-[#b97b4c]/70">MEETING</div>
              <div className="absolute left-[3%] top-[40%] h-[8%] w-[11%] rounded-lg bg-[#c9a27e]/80 shadow" />
              <div className="absolute left-[3%] top-[50%] h-[8%] w-[11%] rounded-lg bg-[#c9a27e]/80 shadow" />
              <div className="absolute left-[15%] top-[46%] grid h-[6%] w-[5%] place-items-center rounded-full bg-[#8a6a4a]/70 text-[clamp(8px,1vw,13px)]">☕</div>
              <div className="absolute left-[4%] top-[35%] text-[clamp(6px,0.75vw,9px)] font-bold tracking-widest text-[#8a6a4a]/70">LOUNGE</div>

              {/* 引き継ぎのルート */}
              {!inMeeting && step > 0 && (
                <svg className="pointer-events-none absolute inset-0 z-[5] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1={fx} y1={fy} x2={tx} y2={ty} stroke={accent} strokeWidth="0.6" strokeDasharray="2 2" className="mb-dash" opacity="0.8" />
                </svg>
              )}

              {/* 自席のデスク */}
              {members.map((m, i) => {
                const active = !inMeeting && i === holder;
                return (
                  <div key={`desk-${m.key}`} className="absolute -translate-x-1/2" style={{ left: `${DESKS[i][0]}%`, top: `${DESKS[i][1] + 5}%` }}>
                    <div className="relative h-[clamp(14px,3vw,40px)] w-[clamp(46px,9vw,110px)] rounded-md bg-[#c89060] shadow" style={active ? { boxShadow: `0 0 0 3px ${accent}88, 0 6px 18px ${accent}55` } : undefined}>
                      <div className={`absolute -top-[55%] left-1/2 h-[60%] w-[44%] -translate-x-1/2 rounded-sm border-2 transition-colors ${active ? "border-slate-500 bg-sky-300" : "border-slate-600 bg-slate-800"}`} />
                    </div>
                    <div className="mt-0.5 text-center text-[clamp(6px,0.75vw,10px)] font-bold text-slate-500">{m.role}</div>
                  </div>
                );
              })}

              <div className="absolute bottom-[3%] left-[1%] h-[10%] w-[3.5%] rounded-full bg-emerald-600/80" />
              <div className="absolute right-[1%] top-[34%] h-[10%] w-[3.5%] rounded-full bg-emerald-700/80" />

              {/* AI社員 */}
              {members.map((m, i) => {
                const [x, y] = posOf(i);
                const mode = modeOf(i);
                const walking = moving.has(m.key);
                const line = lineOf(i);
                const anim = walking ? "mb-walk" : mode === "work" ? "mb-type" : "mb-bob";
                return (
                  <button
                    key={m.key}
                    onClick={() => setSelKey(m.key)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 text-center transition-all duration-[1400ms] ease-in-out ${mode === "work" ? "z-20" : "z-10"}`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    {line && (
                      <span
                        className={`absolute bottom-full z-30 mb-1 block w-max max-w-[min(30vw,190px)] rounded-2xl border bg-white px-2.5 py-1.5 text-left text-[clamp(8px,1vw,12px)] leading-snug text-slate-700 shadow-lg ${x < 18 ? "left-[-20%]" : x > 82 ? "right-[-20%]" : "left-1/2 -translate-x-1/2"}`}
                        style={{ borderColor: `${accent}55` }}
                      >
                        <b className="block text-[0.85em]" style={{ color: accent }}>{m.name}</b>
                        {line}
                      </span>
                    )}
                    <span className={`relative block ${anim}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.portrait}
                        alt={m.name}
                        className="h-[clamp(52px,9vw,112px)] w-[clamp(52px,9vw,112px)] rounded-xl border-[3px] bg-slate-900 object-contain shadow-lg"
                        style={{ borderColor: selKey === m.key ? accent : accent2, boxShadow: selKey === m.key ? `0 0 0 4px ${accent}55` : undefined }}
                      />
                      {mode === "handoff" && <span className="absolute -right-1 -top-1 text-[clamp(10px,1.5vw,18px)]">📄</span>}
                      {mode === "work" && (
                        <span className="absolute -bottom-1 -right-1 flex gap-0.5 rounded-full bg-white px-1.5 py-1 shadow">
                          <i className="mb-dot1 block h-1 w-1 rounded-full bg-emerald-500" />
                          <i className="mb-dot2 block h-1 w-1 rounded-full bg-emerald-500" />
                          <i className="mb-dot3 block h-1 w-1 rounded-full bg-emerald-500" />
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-[clamp(7px,0.9vw,11px)] font-black text-slate-800 [text-shadow:0_1px_0_#fff]">{m.name}</span>
                    <span className={`mt-0.5 inline-block rounded-full px-1.5 py-px text-[clamp(6px,0.75vw,9px)] font-black ${MODE_CLS[mode]}`}>{walking ? "移動中" : MODE_LABEL[mode]}</span>
                    {popStep === step && i === n - 1 && !inMeeting && (
                      <span className="mb-pop pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-emerald-500 px-2 py-0.5 text-[clamp(7px,0.9vw,11px)] font-black text-white shadow">✓ 確認完了 → 承認待ちへ</span>
                    )}
                  </button>
                );
              })}

              {night && <div className="pointer-events-none absolute inset-0 z-40 bg-indigo-950/55 mix-blend-multiply" />}
            </div>
          </div>

          {/* タイムライン（既存の timeline3d） */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <span className="mr-1 text-[10px] font-black tracking-widest text-slate-400">FLOW</span>
            {members.map((m, i) => (
              <span key={m.key} className="flex items-center gap-1.5">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold transition ${!inMeeting && i === holder ? "text-white shadow" : "bg-slate-100 text-slate-500"}`}
                  style={!inMeeting && i === holder ? { backgroundColor: accent } : undefined}
                >
                  {m.role}
                </span>
                {i < n - 1 && <span className="text-slate-300">→</span>}
              </span>
            ))}
            <span className="ml-auto text-[11px] text-slate-400">{inMeeting ? "会議中" : `「${lead}」を処理中`}</span>
          </div>

          {/* DAILY MISSION */}
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-[10px] font-black tracking-widest" style={{ color: accent }}>DAILY MISSION</div>
            <div className="mt-0.5 text-sm font-black text-slate-900">{quest.name}</div>
            <QuestLine label="優先候補（Aランク）" cur={quest.prospect[0]} max={quest.prospect[1]} accent={accent} accent2={accent2} />
            <QuestLine label="商談化" cur={quest.deal[0]} max={quest.deal[1]} accent={accent} accent2={accent2} />
          </div>
        </div>

        {/* DESK / PROFILE */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-[10px] font-black tracking-widest text-slate-400">DESK / PROFILE</div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={me.card} alt={me.name} className="mx-auto mt-3 aspect-square w-full max-w-[280px] rounded-2xl bg-slate-900 object-contain" />
          <div className="mt-3 flex items-center gap-2">
            <span className="text-lg font-black text-slate-900">{me.name}</span>
            <span className="rounded px-1.5 py-0.5 text-[10px] font-black text-white" style={{ backgroundColor: me.rarity === "SSR" ? accent : "#64748b" }}>{me.rarity}</span>
            {me.custom && <span className="rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-bold text-violet-700">登録キャラ</span>}
          </div>
          <div className="text-xs text-slate-500">{me.role}{me.tagline && `・${me.tagline}`}</div>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{me.task}</p>
          {me.move && <div className="mt-2 text-[11px] font-semibold" style={{ color: accent }}>必殺技：{me.move}</div>}
          <ul className="mt-3 space-y-1.5">
            {me.skills.map((k) => (
              <li key={k.name} className="flex items-center gap-2 text-[11px] text-slate-600">
                <span className="w-24 shrink-0">{k.name}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <span className="block h-full rounded-full" style={{ width: `${k.level}%`, background: `linear-gradient(90deg, ${accent}, ${accent2})` }} />
                </span>
                <span className="w-6 text-right font-bold tabular-nums">{k.level}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 text-[10px] font-semibold text-slate-400">担当工程：{me.stage}</div>
        </aside>
      </div>
    </div>
  );
}

function HudCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="mb-1 text-[10px] font-black tracking-widest text-slate-400">{label}</div>
      {children}
    </div>
  );
}

function QuestLine({ label, cur, max, accent, accent2 }: { label: string; cur: number; max: number; accent: string; accent2: string }) {
  return (
    <div className="mt-2">
      <div className="flex justify-between text-xs text-slate-600">
        <span>{label}</span>
        <b className="text-slate-900">{cur} / {max}</b>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (cur / max) * 100)}%`, background: `linear-gradient(90deg, ${accent}, ${accent2})` }} />
      </div>
    </div>
  );
}
