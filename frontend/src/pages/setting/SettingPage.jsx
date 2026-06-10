import { useEffect, useMemo, useState } from "react";
import { FiPlus } from "react-icons/fi";
import PageHeader from "../../components/layout/PageHeader";
import TabNavigation from "../../components/tabs/TabNavigation";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Textarea from "../../components/common/Textarea";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import DataTable from "../../components/tables/DataTable";
import TableActions from "../../components/tables/TableActions";
import Modal from "../../components/modals/Modal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import EmptyState from "../../components/common/EmptyState";
import settingsService from "../../services/settingsService";
import { useToast } from "../../context/ToastContext";

const tabs = [
  { label: "Company Info", value: "company" },
  { label: "Payroll Rules", value: "rules" },
  { label: "Profile", value: "profile" }
];

const emptyCompany = {
  company_name: "PayFlow Holdings Ltd",
  company_email: "",
  company_phone: "",
  company_address: ""
};

const emptyPayroll = {
  default_currency: "",
  payroll_cycle: "",
  default_overtime_rate: ""
};

const emptyTax = {
  tax_percentage: "",
  pension_percentage: ""
};

const emptyProfile = {
  username: "admin",
  email: "admin@payflow.app",
  status: ""
};

export default function SettingPage() {
  const [activeTab, setActiveTab] = useState("company");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [company, setCompany] = useState(emptyCompany);
  const [payroll, setPayroll] = useState(emptyPayroll);
  const [tax, setTax] = useState(emptyTax);
  const [profile, setProfile] = useState(emptyProfile);
  const { showToast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      setError("");
      const [companyData, payrollData, profileData] = await Promise.all([
        settingsService.getCompany(),
        settingsService.getPayroll(),
        settingsService.getProfile()
      ]);
      setCompany({ ...emptyCompany, ...companyData });
      setPayroll(payrollData ? { ...emptyPayroll, ...payrollData } : emptyPayroll);
      setTax(payrollData ? { ...emptyTax, ...payrollData } : emptyTax);
      setProfile({ ...emptyProfile, ...profileData });
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }

  const currentTable = useMemo(() => {
    if (activeTab === "company") {
      return {
        buttonLabel: "Add New Company Info",
        modalTitle: "Company Info",
        rows: [{ id: 1, ...company }],
        columns: [
          { key: "company_name", label: "Company Name" },
          { key: "company_email", label: "Email" },
          { key: "company_phone", label: "Phone" },
          { key: "company_address", label: "Address" },
          {
            key: "actions",
            label: "Actions",
            render: () => (
              <TableActions
                onEdit={() => {
                  setEditing(true);
                  setModalOpen(true);
                }}
                onDelete={() => setConfirmDeleteOpen(true)}
                editLabel="Edit company settings"
                deleteLabel="Delete company settings"
              />
            )
          }
        ]
      };
    }

    if (activeTab === "rules") {
      const hasPayrollRule = Boolean(
        payroll.default_currency ||
        payroll.payroll_cycle ||
        payroll.default_overtime_rate ||
        tax.tax_percentage ||
        tax.pension_percentage
      );

      return {
        buttonLabel: "Add New Payroll Rule",
        modalTitle: "Payroll Rules",
        rows: hasPayrollRule ? [{ id: 1, ...payroll, ...tax }] : [],
        columns: [
          { key: "default_currency", label: "Default Currency" },
          { key: "payroll_cycle", label: "Payroll Cycle" },
          { key: "default_overtime_rate", label: "Default Overtime Rate" },
          { key: "tax_percentage", label: "Tax Percentage" },
          { key: "pension_percentage", label: "Pension Percentage" },
          {
            key: "actions",
            label: "Actions",
            render: () => (
              <TableActions
                onEdit={() => {
                  setEditing(true);
                  setModalOpen(true);
                }}
                onDelete={() => setConfirmDeleteOpen(true)}
                editLabel="Edit payroll rules"
                deleteLabel="Delete payroll rules"
              />
            )
          }
        ]
      };
    }

    return {
      buttonLabel: "Add New Profile Info",
      modalTitle: "Profile Settings",
      rows: [{ id: 1, ...profile }],
      columns: [
        { key: "username", label: "Username" },
        { key: "email", label: "Email" },
        { key: "status", label: "Status" },
        {
          key: "actions",
          label: "Actions",
          render: () => (
            <TableActions
              onEdit={() => {
                setEditing(true);
                setModalOpen(true);
              }}
              onDelete={() => setConfirmDeleteOpen(true)}
              editLabel="Edit profile settings"
              deleteLabel="Delete profile settings"
            />
          )
        }
      ]
    };
  }, [activeTab, company, payroll, profile, tax]);

  async function saveCurrentTab() {
    try {
      if (activeTab === "company") {
        await settingsService.updateCompany(company);
      }
      if (activeTab === "rules") {
        await settingsService.updatePayroll({ ...payroll, ...tax });
      }
      if (activeTab === "profile") {
        await settingsService.updateProfile(profile);
      }
      showToast("Settings saved successfully.", "success");
      setModalOpen(false);
      setEditing(false);
      await loadSettings();
    } catch (saveError) {
      showToast(saveError.message, "error");
    }
  }

  async function deleteCurrentTabRecord() {
    try {
      if (activeTab === "company") {
        await settingsService.updateCompany(emptyCompany);
        setCompany(emptyCompany);
      }
      if (activeTab === "rules") {
        await settingsService.updatePayroll({ ...emptyPayroll, ...emptyTax });
        setPayroll(emptyPayroll);
        setTax(emptyTax);
      }
      if (activeTab === "profile") {
        const resetProfile = { ...emptyProfile, status: profile.status || "" };
        await settingsService.updateProfile(resetProfile);
        setProfile(resetProfile);
      }

      showToast("Record deleted successfully.", "success");
      setConfirmDeleteOpen(false);
      await loadSettings();
    } catch (deleteError) {
      showToast(deleteError.message, "error");
    }
  }

  if (loading) {
    return <LoadingSpinner label="Loading settings..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Setting" description="Maintain company information, payroll rules, and your profile in one simple section." />
      {error ? (
        <Card>
          <p className="text-sm font-medium text-rose-600">{error}</p>
        </Card>
      ) : null}
      <Card className="p-0">
        <div className="px-5 pt-5">
          <TabNavigation tabs={tabs} value={activeTab} onChange={setActiveTab} />
        </div>
        <div className="space-y-5 p-5">
          <div className="flex justify-end">
            <Button
              icon={FiPlus}
              onClick={() => {
                setEditing(false);
                if (activeTab === "rules" && !currentTable.rows.length) {
                  setPayroll(emptyPayroll);
                  setTax(emptyTax);
                }
                setModalOpen(true);
              }}
            >
              {currentTable.buttonLabel}
            </Button>
          </div>

          {currentTable.rows.length ? (
            <DataTable rows={currentTable.rows} columns={currentTable.columns} pageSize={5} />
          ) : (
            <EmptyState
              title={`No ${currentTable.modalTitle.toLowerCase()} found`}
              description={
                activeTab === "rules"
                  ? "Add and save a payroll rule to populate this table."
                  : `Add and save a ${currentTable.modalTitle.toLowerCase().replace(" settings", "").replace(" info", "")} to populate this table.`
              }
            />
          )}
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(false);
        }}
        title={currentTable.modalTitle}
        description={editing ? "Edit this settings record." : "Add or update this settings record."}
      >
        <div className="space-y-5">
          {activeTab === "company" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Company Name" value={company.company_name} onChange={(event) => setCompany((current) => ({ ...current, company_name: event.target.value }))} />
              <Input label="Company Email" value={company.company_email} onChange={(event) => setCompany((current) => ({ ...current, company_email: event.target.value }))} />
              <Input label="Company Phone" value={company.company_phone} onChange={(event) => setCompany((current) => ({ ...current, company_phone: event.target.value }))} />
              <div className="md:col-span-2">
                <Textarea label="Company Address" value={company.company_address} onChange={(event) => setCompany((current) => ({ ...current, company_address: event.target.value }))} />
              </div>
            </div>
          ) : null}

          {activeTab === "rules" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Default Currency" value={payroll.default_currency} onChange={(event) => setPayroll((current) => ({ ...current, default_currency: event.target.value }))} />
              <Select label="Payroll Cycle" value={payroll.payroll_cycle} onChange={(event) => setPayroll((current) => ({ ...current, payroll_cycle: event.target.value }))} options={["Monthly", "Bi-weekly", "Weekly"]} />
              <Input label="Default Overtime Rate" value={payroll.default_overtime_rate} onChange={(event) => setPayroll((current) => ({ ...current, default_overtime_rate: event.target.value }))} />
              <Input label="Tax Percentage" value={tax.tax_percentage} onChange={(event) => setTax((current) => ({ ...current, tax_percentage: event.target.value }))} />
              <Input label="Pension Percentage" value={tax.pension_percentage} onChange={(event) => setTax((current) => ({ ...current, pension_percentage: event.target.value }))} />
            </div>
          ) : null}

          {activeTab === "profile" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Username" value={profile.username} onChange={(event) => setProfile((current) => ({ ...current, username: event.target.value }))} />
              <Input label="Email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} />
              <Input label="Status" value={profile.status} readOnly />
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setModalOpen(false);
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveCurrentTab}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Record?"
        description="This will reset the current settings record. Do you want to continue?"
        confirmText="Delete"
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={deleteCurrentTabRecord}
      />
    </div>
  );
}
