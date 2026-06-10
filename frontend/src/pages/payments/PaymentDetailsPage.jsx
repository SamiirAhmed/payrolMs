import { useMemo } from "react";
import { useParams } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import InfoList from "../../components/common/InfoList";
import { payments } from "../../data/mockData";
import { formatCurrency } from "../../utils/format";

export default function PaymentDetailsPage() {
  const { id } = useParams();
  const payment = useMemo(() => payments.find((item) => String(item.id) === id) || payments[0], [id]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payment Details"
        description="Inspect recorded payment information, references, and completion status."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Payments", to: "/payments" }, { label: "Details" }]}
      />
      <Card title={payment.payroll} subtitle={payment.paymentDate}>
        <InfoList
          items={[
            { label: "Payment Method", value: payment.paymentMethod },
            { label: "Reference Number", value: payment.referenceNumber },
            { label: "Amount Paid", value: formatCurrency(payment.amountPaid) },
            { label: "Payment Status", value: payment.paymentStatus },
            { label: "Received By", value: payment.receivedBy }
          ]}
          columns={3}
        />
      </Card>
    </div>
  );
}
