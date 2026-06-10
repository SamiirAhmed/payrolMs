import { useState } from "react";
import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import Tabs from "../../components/common/Tabs";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Button from "../../components/common/Button";
import { settingsSections } from "../../data/mockData";

export default function SettingsPage() {
  const [tab, setTab] = useState("company");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configure company profile, payroll rules, taxes, currency, notifications, and experience preferences."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Settings" }]}
      />
      <Tabs tabs={settingsSections.map((item) => ({ label: item.label, value: item.id }))} value={tab} onChange={setTab} />
      <Card title="System configuration" subtitle="These settings are ready to be mapped to backend preferences tables and APIs.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input label="Company name" defaultValue="PayFlow Holdings Ltd" />
          <Input label="Payroll cutoff day" defaultValue="27" />
          <Input label="Default currency" defaultValue="USD" />
          <Select label="Tax model" options={["Progressive", "Flat", "Custom"]} />
          <Select label="Theme preference" options={["Light", "System", "Dark"]} />
          <Select label="Payroll approval" options={["Single approval", "Dual approval"]} />
        </div>
        <div className="mt-6 flex justify-end">
          <Button>Save settings</Button>
        </div>
      </Card>
    </div>
  );
}
