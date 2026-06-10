import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBell, FiChevronDown, FiChevronsLeft, FiChevronsRight, FiMenu, FiSearch } from "react-icons/fi";
import Dropdown from "../common/Dropdown";
import { notifications } from "../../data/mockData";
import { initials } from "../../utils/helpers";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ onMenuClick, collapsed = false, onToggleSidebar }) {
  const [search, setSearch] = useState("");
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = useMemo(() => {
    const titles = {
      "/dashboard": "Dashboard",
      "/employee": "Employee",
      "/attendance": "Attendance",
      "/payroll": "Payroll",
      "/reporting": "Reporting",
      "/setting": "Setting"
    };
    return titles[location.pathname] || "Payroll";
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-lg border border-slate-200 p-2.5 lg:hidden" onClick={onMenuClick}>
            <FiMenu />
          </button>
          <button
            type="button"
            className="hidden rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:text-slate-900 xl:inline-flex"
            onClick={onToggleSidebar}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
          </button>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{pageTitle}</h1>
          </div>
          <div className="relative hidden md:block">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search..."
              className="form-input w-72 pl-10"
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Dropdown
            trigger={
              <button type="button" className="relative rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:text-slate-900">
                <FiBell />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
              </button>
            }
            items={notifications.map((item) => ({
              label: item.title
            }))}
          />
          <Dropdown
            trigger={
              <button type="button" className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 font-semibold text-slate-700">
                  {initials(user?.name)}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                  <p className="text-xs text-slate-500">{user?.role}</p>
                </div>
                <FiChevronDown className="text-slate-500" />
              </button>
            }
            items={[
              { label: "My Profile", onClick: () => navigate("/setting") },
              { label: "Logout", onClick: logout }
            ]}
          />
        </div>
      </div>
    </header>
  );
}
