import { FiDownload, FiFileText, FiPrinter } from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import MetricStrip from "../../components/common/MetricStrip";
import PaymentStatusChart from "../../components/charts/PaymentStatusChart";
import PayrollTrendChart from "../../components/charts/PayrollTrendChart";
import { paymentStatusChart, payrollTrend, reports } from "../../data/mockData";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generate modern payroll, payment, department, attendance, and overtime reports with export-ready actions."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Reports" }]}
      />
      <div className="panel flex flex-col gap-4 p-6 lg:flex-row lg:items-end">
        <div className="grid flex-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input type="date" className="form-input" />
          <input type="date" className="form-input" />
          <select className="form-input"><option>All report types</option></select>
          <select className="form-input"><option>All departments</option></select>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" icon={FiDownload}>Export PDF</Button>
          <Button variant="outline" icon={FiFileText}>Export Excel</Button>
          <Button icon={FiPrinter}>Print</Button>
        </div>
      </div>
      <MetricStrip
        metrics={[
          { label: "Payroll Summary", value: 284000, currency: true },
          { label: "Payment Report", value: "79 transactions" },
          { label: "Attendance Report", value: "96.2%" },
          { label: "Overtime Report", value: 12640, currency: true }
        ]}
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <PayrollTrendChart data={payrollTrend} />
        <PaymentStatusChart data={paymentStatusChart} />
      </div>
      <Card title="Available Reports" subtitle="Prepared report packages for export and review">
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-bold text-slate-900">{report.name}</p>
                <p className="mt-1 text-sm text-slate-500">{report.range} • Owned by {report.owner}</p>
              </div>
              <Button variant="outline">{report.status}</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
