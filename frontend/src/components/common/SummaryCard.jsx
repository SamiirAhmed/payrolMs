import { formatCurrency } from "../../utils/format";

export default function SummaryCard({ title, value, currency = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">
        {currency ? formatCurrency(value) : value}
      </p>
    </div>
  );
}
