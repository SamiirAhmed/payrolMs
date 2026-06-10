import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/auth/LoginPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import EmployeePage from "../pages/employee/EmployeePage";
import AttendancePage from "../pages/attendance/AttendancePage";
import PayrollPage from "../pages/payroll/PayrollPage";
import ReportingPage from "../pages/reporting/ReportingPage";
import SettingPage from "../pages/setting/SettingPage";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route
          path="/*"
          element={
            <AppLayout>
              <AppModules />
            </AppLayout>
          }
        />
      </Route>
    </Routes>
  );
}

function AppModules() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/employee" element={<EmployeePage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/payroll" element={<PayrollPage />} />
      <Route path="/reporting" element={<ReportingPage />} />
      <Route path="/setting" element={<SettingPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
