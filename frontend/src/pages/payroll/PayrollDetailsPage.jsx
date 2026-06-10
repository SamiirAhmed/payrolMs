import { useMemo } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import InfoList from "../../components/common/InfoList";
import Badge from "../../components/common/Badge";
import { payrolls } from "../../data/mockData";
import { formatCurrency } from "../../utils/format";

export default function PayrollDetailsPage() {
  const { id } = useParams();
  const payroll = useMemo(() => payrolls.find((item) => String(item.id) === id) || payrolls[0], [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll Details"
        description="Detailed payroll computation including earnings, deductions, overtime, and processing metadata."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Payroll", to: "/payroll/records" }, { label: payroll.employee }]}
      />
      <div className="panel flex items-center justify-between p-6">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-950">{payroll.employee}</h2>
          <p className="mt-1 text-sm text-slate-500">{payroll.period}</p>
        </div>
        <Badge>{payroll.status}</Badge>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Employee summary">
          <InfoList
            items={[
              { label: "Basic Salary", value: formatCurrency(payroll.basicSalary) },
              { label: "Allowances", value: formatCurrency(payroll.allowances) },
              { label: "Overtime", value: formatCurrency(payroll.overtime) },
              { label: "Deductions", value: formatCurrency(payroll.deductions) }
            ]}
          />
        </Card>
        <Card title="Processing info">
          <InfoList
            items={[
              { label: "Gross Salary", value: formatCurrency(payroll.grossSalary) },
              { label: "Net Salary", value: formatCurrency(payroll.netSalary) },
              { label: "Processed By", value: payroll.processedBy },
              { label: "Processed Date", value: payroll.processedDate }
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
