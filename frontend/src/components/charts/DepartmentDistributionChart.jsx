import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ChartCard from "./ChartCard";

const colors = ["#2563eb", "#0ea5e9", "#14b8a6", "#f59e0b", "#8b5cf6"];

export default function DepartmentDistributionChart({ data }) {
  return (
    <ChartCard title="Department Distribution" subtitle="Employee spread by department">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} innerRadius={58} paddingAngle={5}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
