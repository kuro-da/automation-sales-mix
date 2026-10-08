import { getBusiness } from "@/lib/businesses";
import { STAGE_LABEL } from "@/lib/sequences";

export function BizBadge({ id }: { id: string }) {
  const b = getBusiness(id);
  if (!b) return null;
  return (
    <span className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white" style={{ backgroundColor: b.hex }}>
      {b.short}
    </span>
  );
}

const STAGE_STYLE: Record<string, string> = {
  A: "bg-sky-100 text-sky-800",
  B: "bg-amber-100 text-amber-800",
  C: "bg-fuchsia-100 text-fuchsia-800",
  done: "bg-emerald-100 text-emerald-800",
};

export function StageBadge({ stage }: { stage: "A" | "B" | "C" | "done" }) {
  return <span className={`inline-block rounded-md px-2 py-0.5 text-xs font-bold ${STAGE_STYLE[stage]}`}>{STAGE_LABEL[stage]}</span>;
}

export const STATUS_LABEL: Record<string, string> = {
  new: "新規",
  appointed: "アポ獲得",
  negotiating: "商談中",
  won: "成約",
  lost: "失注",
};

export function PageHeader({ title, desc, children }: { title: string; desc?: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{title}</h1>
        {desc && <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-600">{desc}</p>}
      </div>
      {children}
    </div>
  );
}
