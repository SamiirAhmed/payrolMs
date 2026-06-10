import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-slate-50">
      <div className="flex h-full">
        <div className={`fixed inset-y-0 left-0 hidden border-r border-slate-200 bg-white transition-all duration-200 xl:block ${sidebarCollapsed ? "w-20" : "w-64"}`}>
          <Sidebar collapsed={sidebarCollapsed} />
        </div>
        {mobileOpen ? (
          <div className="fixed inset-0 z-40 bg-slate-900/30 xl:hidden" onClick={() => setMobileOpen(false)}>
            <div className="h-full w-64 bg-white" onClick={(event) => event.stopPropagation()}>
              <Sidebar mobile onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        ) : null}
        <div className={`flex min-w-0 flex-1 flex-col transition-all duration-200 ${sidebarCollapsed ? "xl:ml-20" : "xl:ml-64"}`}>
          <Topbar
            onMenuClick={() => setMobileOpen(true)}
            collapsed={sidebarCollapsed}
            onToggleSidebar={() => setSidebarCollapsed((current) => !current)}
          />
          <div className="flex-1 overflow-y-auto">
            <main className="px-4 pb-6 pt-2 md:px-6">{children}</main>
            <footer className="px-6 py-4 text-sm text-slate-500">
              PayFlow Payroll System
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
