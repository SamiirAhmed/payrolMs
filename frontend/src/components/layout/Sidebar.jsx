import { NavLink } from "react-router-dom";
import { sidebarItems } from "../../data/mockData";
import { classNames } from "../../utils/helpers";
import BrandLogo from "../common/BrandLogo";

export default function Sidebar({ mobile = false, collapsed = false, onNavigate }) {
  return (
    <aside className={classNames("flex h-full flex-col overflow-hidden bg-white", mobile ? "" : "")}>
      <div className={classNames("border-b border-slate-200 py-5", collapsed ? "px-3" : "px-5")}>
        <BrandLogo compact={collapsed} />
      </div>
      <nav className={classNames("flex-1 space-y-1 py-4", collapsed ? "px-2" : "px-3")}>
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.key}
              to={item.path}
              onClick={onNavigate}
              className={({ isActive }) =>
                classNames(
                  "nav-item",
                  collapsed && "justify-center px-0",
                  isActive && "nav-item-active"
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="text-lg" />
              {collapsed ? null : item.label}
            </NavLink>
          );
        })}
      </nav>
      {collapsed ? (
        <div className="border-t border-slate-200 px-2 py-4 text-center text-xs font-semibold text-slate-400">
          @
        </div>
      ) : (
        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-500">
          <p className="whitespace-nowrap">@ Copyright 2026 All Rights Reversed</p>
        </div>
      )}
    </aside>
  );
}
