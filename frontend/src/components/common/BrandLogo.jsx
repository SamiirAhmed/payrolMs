export default function BrandLogo({ compact = false }) {
  return (
    <div className={`flex items-center ${compact ? "justify-center" : "gap-3 py-1"}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 shadow-sm">
        <svg
          viewBox="0 0 48 48"
          className="h-8 w-8"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <rect x="8" y="10" width="32" height="28" rx="8" fill="white" fillOpacity="0.08" />
          <path
            d="M16 29V19.5C16 18.1193 17.1193 17 18.5 17H25C28.866 17 32 20.134 32 24C32 27.866 28.866 31 25 31H20"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 24H29"
            stroke="#94A3B8"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M17 34H31"
            stroke="#CBD5E1"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.9"
          />
        </svg>
      </div>
      {compact ? null : (
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-slate-500">
            Payflow
          </p>
          <p className="text-2xl font-semibold tracking-tight text-slate-950">
            Payroll
          </p>
        </div>
      )}
    </div>
  );
}
