import type { EvaluationAxis } from "@/lib/types";

export function scoreColor(score0to100: number): string {
  if (score0to100 >= 80) return "#16a34a";
  if (score0to100 >= 60) return "#2563eb";
  if (score0to100 >= 40) return "#d97706";
  return "#dc2626";
}

export function ScoreRing({
  score,
  size = 96,
  label,
}: {
  score: number;
  size?: number;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped / 100);
  const color = scoreColor(clamped);

  return (
    <div className="inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="central"
          textAnchor="middle"
          className="rotate-90 fill-slate-800 font-bold"
          style={{ fontSize: size * 0.28, transformOrigin: "center" }}
        >
          {clamped}
        </text>
      </svg>
      {label ? (
        <span className="mt-1 text-xs text-slate-500">{label}</span>
      ) : null}
    </div>
  );
}

export function AxisBars({ axes }: { axes: EvaluationAxis[] }) {
  return (
    <ul className="space-y-3">
      {axes.map((a) => (
        <li key={a.key}>
          <div className="mb-1 flex items-baseline justify-between gap-2">
            <span className="text-sm font-medium text-slate-700">
              {a.label}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              {a.score} / 5
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-500"
              style={{ width: `${(a.score / 5) * 100}%` }}
            />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-500">
            {a.comment}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function Sparkline({
  points,
  width = 320,
  height = 72,
}: {
  points: number[];
  width?: number;
  height?: number;
}) {
  if (points.length === 0) {
    return (
      <div className="text-xs text-slate-400">データがまだありません</div>
    );
  }
  const pad = 6;
  const max = 100;
  const min = 0;
  const stepX =
    points.length > 1 ? (width - pad * 2) / (points.length - 1) : 0;
  const y = (v: number) =>
    height - pad - ((v - min) / (max - min)) * (height - pad * 2);
  const d = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${pad + i * stepX} ${y(p)}`)
    .join(" ");
  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} className="overflow-visible">
      <line
        x1={pad}
        y1={y(60)}
        x2={width - pad}
        y2={y(60)}
        stroke="#e2e8f0"
        strokeDasharray="4 4"
      />
      <path d={d} fill="none" stroke={scoreColor(last)} strokeWidth={2} />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={pad + i * stepX}
          cy={y(p)}
          r={i === points.length - 1 ? 3.5 : 2.5}
          fill={scoreColor(p)}
        />
      ))}
    </svg>
  );
}
