import PageHeader from "../../components/layout/PageHeader";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your user profile, personal information, and password settings."
        breadcrumbs={[{ label: "Home", to: "/" }, { label: "Profile" }]}
      />
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card title="User Profile Card">
          <div className="rounded-[2rem] bg-slate-950 p-6 text-white">
            <p className="text-sm font-semibold text-brand-300">{user?.role}</p>
            <h2 className="mt-3 text-3xl font-extrabold">{user?.name}</h2>
            <p className="mt-2 text-sm text-slate-300">{user?.email}</p>
          </div>
        </Card>
        <Card title="Update personal information">
          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Full name" defaultValue={user?.name} />
            <Input label="Email" defaultValue={user?.email} />
            <Input label="Department" defaultValue={user?.department} />
            <Input label="Job title" defaultValue={user?.title} />
            <Input label="Current password" type="password" />
            <Input label="New password" type="password" />
          </div>
          <div className="mt-6 flex justify-end">
            <Button>Save profile</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
