import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";
import { formatCurrency } from "../../utils/format";

export default function PayrollTrendChart({ data }) {
  return (
    <ChartCard title="Monthly Payroll Trend" subtitle="Processed versus paid payroll over the last 6 months">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="payrollGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0.04" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => `$${value / 1000}k`} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value) => formatCurrency(value)} />
          <Area type="monotone" dataKey="payroll" stroke="#2563eb" fill="url(#payrollGradient)" strokeWidth={3} />
          <Area type="monotone" dataKey="paid" stroke="#0f172a" fill="transparent" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
