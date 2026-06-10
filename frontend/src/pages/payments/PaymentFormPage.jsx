import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/layout/PageHeader";
import EntityFormShell from "../../components/forms/EntityFormShell";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import { useForm } from "../../hooks/useForm";
import { payrolls } from "../../data/mockData";
import { useToast } from "../../context/ToastContext";

export default function PaymentFormPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { values, errors, handleChange, handleSubmit } = useForm(
    { payroll: "", paymentDate: "", paymentMethod: "", referenceNumber: "", amountPaid: "", paymentStatus: "", receivedBy: "" },
    (current) => {
      const nextErrors = {};
      ["payroll", "paymentDate", "paymentMethod", "amountPaid", "paymentStatus"].forEach((field) => {
        if (!current[field]) nextErrors[field] = "This field is required.";
      });
      return nextErrors;
    }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Record Payment"
        description="Capture payment details, references, method, and settlement status for payroll disbursement."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Payments", to: "/payments" }, { label: "Record Payment" }]}
      />
      <EntityFormShell
        title="Payment form"
        description="Ready to connect with your payment recording REST endpoint."
        onSubmit={handleSubmit(() => {
          showToast("Payment recorded successfully.", "success");
          navigate("/payments");
        })}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Select label="Payroll" name="payroll" value={values.payroll} onChange={handleChange} options={payrolls.map((item) => `${item.employee} - ${item.period}`)} error={errors.payroll} />
          <Input label="Payment date" name="paymentDate" type="date" value={values.paymentDate} onChange={handleChange} error={errors.paymentDate} />
          <Select label="Payment method" name="paymentMethod" value={values.paymentMethod} onChange={handleChange} options={["Bank", "Cash", "Mobile Money"]} error={errors.paymentMethod} />
          <Input label="Reference number" name="referenceNumber" value={values.referenceNumber} onChange={handleChange} />
          <Input label="Amount paid" name="amountPaid" type="number" value={values.amountPaid} onChange={handleChange} error={errors.amountPaid} />
          <Select label="Payment status" name="paymentStatus" value={values.paymentStatus} onChange={handleChange} options={["Pending", "Completed", "Failed"]} error={errors.paymentStatus} />
          <Input label="Received by" name="receivedBy" value={values.receivedBy} onChange={handleChange} />
        </div>
      </EntityFormShell>
    </div>
  );
}
