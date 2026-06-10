import { useState } from "react";

export default function Dropdown({ trigger, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div onClick={() => setOpen((current) => !current)}>{trigger}</div>
      {open ? (
        <div className="absolute right-0 z-20 mt-3 min-w-48 rounded-2xl border border-slate-200 bg-white p-2 shadow-soft">
          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setOpen(false);
                item.onClick?.();
              }}
              className="flex w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
