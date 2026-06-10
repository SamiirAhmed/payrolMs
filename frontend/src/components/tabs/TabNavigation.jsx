import { classNames } from "../../utils/helpers";

export default function TabNavigation({ tabs, value, onChange }) {
  return (
    <div className="border-b border-slate-200">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={classNames(
              "rounded-t-lg border border-b-0 px-4 py-2 text-sm font-medium transition",
              value === tab.value
                ? "border-slate-300 bg-white text-slate-900"
                : "border-transparent bg-transparent text-slate-500 hover:text-slate-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
