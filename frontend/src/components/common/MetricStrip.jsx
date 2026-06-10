import { formatCurrency } from "../../utils/format";

export default function MetricStrip({ metrics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.label} className="panel-muted p-4">
          <p className="text-sm font-semibold text-slate-500">{metric.label}</p>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {metric.currency ? formatCurrency(metric.value) : metric.value}
          </p>
          {metric.caption ? <p className="mt-2 text-xs font-semibold text-slate-400">{metric.caption}</p> : null}
        </div>
      ))}
    </div>
  );
}
