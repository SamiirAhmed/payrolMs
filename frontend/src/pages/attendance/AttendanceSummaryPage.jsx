import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import MetricStrip from "../../components/common/MetricStrip";

export default function AttendanceSummaryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance Summary"
        description="Visual attendance overview for daily and monthly workforce management."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Attendance", to: "/attendance" }, { label: "Summary" }]}
      />
      <MetricStrip
        metrics={[
          { label: "Attendance Rate", value: "96.2%" },
          { label: "Late Arrivals", value: 14 },
          { label: "Leave Days", value: 22 },
          { label: "Absence Alerts", value: 4 }
        ]}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Attendance Calendar">
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {Array.from({ length: 28 }).map((_, index) => (
              <div key={index} className={`rounded-2xl p-4 font-bold ${index % 6 === 0 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                {index + 1}
              </div>
            ))}
          </div>
        </Card>
        <Card title="Attendance Status Cards">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Present", 234],
              ["Late", 18],
              ["Leave", 22],
              ["Half-day", 11]
            ].map(([label, value]) => (
              <div key={label} className="panel-muted p-5">
                <p className="text-sm font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
