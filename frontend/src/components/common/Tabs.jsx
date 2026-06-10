import { classNames } from "../../utils/helpers";

export default function Tabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex rounded-2xl bg-slate-100 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={classNames(
            "rounded-2xl px-4 py-2 text-sm font-semibold transition",
            value === tab.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
