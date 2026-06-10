import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartCard from "./ChartCard";

export default function PaymentStatusChart({ data }) {
  return (
    <ChartCard title="Payment Status" subtitle="Current payment completion mix">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Bar dataKey="value" radius={[14, 14, 0, 0]} fill="#1d4ed8" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
