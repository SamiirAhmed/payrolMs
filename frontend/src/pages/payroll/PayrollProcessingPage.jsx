import { useState } from "react";
import { FiPlay } from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import MetricStrip from "../../components/common/MetricStrip";
import payrollService from "../../services/payrollService";

export default function PayrollProcessingPage() {
  const [period, setPeriod] = useState("April 2026");
  const [scope, setScope] = useState("all");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const process = async () => {
    setLoading(true);
    const response = await payrollService.processPayroll({ period, scope });
    setResult(response);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Processing"
        description="Run payroll by period for a single employee or the whole organization with clear processing feedback."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Payroll", to: "/payroll/records" }, { label: "Processing" }]}
      />
      <MetricStrip
        metrics={[
          { label: "Selected Period", value: period },
          { label: "Process Scope", value: scope === "all" ? "All employees" : "Single employee" },
          { label: "Projected Gross", value: 284000, currency: true },
          { label: "Open Exceptions", value: 3 }
        ]}
      />
      <Card title="Run payroll" subtitle="Start payroll generation and show progress-ready results">
        <div className="grid gap-4 lg:grid-cols-3">
          <Select label="Payroll period" value={period} onChange={(event) => setPeriod(event.target.value)} options={["April 2026", "March 2026", "February 2026"]} />
          <Select label="Process mode" value={scope} onChange={(event) => setScope(event.target.value)} options={[{ value: "all", label: "All employees" }, { value: "single", label: "Single employee" }]} />
          <div className="flex items-end">
            <Button className="w-full" icon={FiPlay} loading={loading} onClick={process}>
              Process payroll
            </Button>
          </div>
        </div>
        {result ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="panel-muted p-4"><p className="text-sm text-slate-500">Processed</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{result.processed}</p></div>
            <div className="panel-muted p-4"><p className="text-sm text-slate-500">Failed</p><p className="mt-2 text-2xl font-extrabold text-slate-900">{result.failed}</p></div>
            <div className="panel-muted p-4"><p className="text-sm text-slate-500">Status</p><p className="mt-2 text-2xl font-extrabold text-emerald-700">Completed</p></div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
