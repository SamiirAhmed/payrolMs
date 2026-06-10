import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { FiDownload, FiPrinter } from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { payrolls, payslips } from "../../data/mockData";
import { formatCurrency } from "../../utils/format";

export default function PayslipPreviewPage() {
  const { id } = useParams();
  const payslip = useMemo(() => payslips.find((item) => String(item.id) === id) || payslips[0], [id]);
  const payroll = useMemo(() => payrolls.find((item) => item.employee === payslip.employee) || payrolls[0], [payslip]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payslip Preview"
        description="Professional payslip presentation with earnings, deductions, and net pay highlight."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Payslips", to: "/payslips" }, { label: payslip.employee }]}
      />
      <Card
        title="Employee Payslip"
        subtitle={`${payslip.payslipNumber} • ${payslip.period}`}
        action={
          <div className="flex gap-3">
            <Button variant="outline" icon={FiDownload}>Download</Button>
            <Button icon={FiPrinter}>Print</Button>
          </div>
        }
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-6">
            <div className="panel-muted p-5">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">Employee Info</p>
              <h3 className="mt-3 text-2xl font-extrabold text-slate-950">{payslip.employee}</h3>
              <p className="mt-2 text-sm text-slate-500">Payroll period: {payslip.period}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5">
                <p className="text-sm font-bold text-emerald-700">Earnings</p>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between"><span>Basic Salary</span><span>{formatCurrency(payroll.basicSalary)}</span></div>
                  <div className="flex justify-between"><span>Allowances</span><span>{formatCurrency(payroll.allowances)}</span></div>
                  <div className="flex justify-between"><span>Overtime</span><span>{formatCurrency(payroll.overtime)}</span></div>
                </div>
              </div>
              <div className="rounded-3xl border border-rose-100 bg-rose-50 p-5">
                <p className="text-sm font-bold text-rose-700">Deductions</p>
                <div className="mt-4 space-y-3 text-sm text-slate-700">
                  <div className="flex justify-between"><span>Statutory Deductions</span><span>{formatCurrency(payroll.deductions)}</span></div>
                  <div className="flex justify-between"><span>Other Deductions</span><span>{formatCurrency(0)}</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-brand-300">Net Salary</p>
            <p className="mt-5 text-5xl font-extrabold">{formatCurrency(payroll.netSalary)}</p>
            <p className="mt-3 text-sm text-slate-300">Processed by {payroll.processedBy}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
