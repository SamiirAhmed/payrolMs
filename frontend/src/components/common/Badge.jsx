import { classNames } from "../../utils/helpers";

const tones = {
  Active: "bg-emerald-100 text-emerald-700",
  Approved: "bg-emerald-100 text-emerald-700",
  Paid: "bg-emerald-100 text-emerald-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Processing: "bg-sky-100 text-sky-700",
  Draft: "bg-slate-100 text-slate-700",
  Open: "bg-blue-100 text-blue-700",
  Closed: "bg-slate-200 text-slate-700",
  Rejected: "bg-rose-100 text-rose-700",
  Failed: "bg-rose-100 text-rose-700",
  "On Leave": "bg-violet-100 text-violet-700",
  Late: "bg-amber-100 text-amber-700",
  Present: "bg-emerald-100 text-emerald-700",
  "Half-day": "bg-orange-100 text-orange-700",
  Leave: "bg-violet-100 text-violet-700"
};

export default function Badge({ children, tone, className }) {
  const palette = tones[tone || children] || "bg-slate-100 text-slate-700";
  return (
    <span className={classNames("inline-flex rounded-full px-3 py-1 text-xs font-bold", palette, className)}>
      {children}
    </span>
  );
}
