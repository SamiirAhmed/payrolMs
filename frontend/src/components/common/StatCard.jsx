import Card from "./Card";
import { formatCompactNumber, formatCurrency } from "../../utils/format";

const tones = {
  blue: "from-brand-500/15 to-sky-200/50 text-brand-700",
  emerald: "from-emerald-500/15 to-emerald-200/50 text-emerald-700",
  amber: "from-amber-500/15 to-amber-200/50 text-amber-700",
  violet: "from-violet-500/15 to-violet-200/50 text-violet-700",
  rose: "from-rose-500/15 to-rose-200/50 text-rose-700",
  sky: "from-sky-500/15 to-cyan-200/50 text-sky-700"
};

export default function StatCard({ label, value, delta, icon: Icon, tone = "blue", isCurrency = false }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {isCurrency ? formatCurrency(value) : formatCompactNumber(value)}
          </p>
          <p className="mt-2 text-sm font-semibold text-emerald-600">{delta} vs last month</p>
        </div>
        <div className={`rounded-3xl bg-gradient-to-br p-4 ${tones[tone]}`}>
          <Icon className="text-2xl" />
        </div>
      </div>
    </Card>
  );
}
