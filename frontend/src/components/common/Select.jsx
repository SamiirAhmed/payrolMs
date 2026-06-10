export default function Select({ label, error, options = [], placeholder, ...props }) {
  const resolvedPlaceholder = placeholder || (label ? `Select ${label.toLowerCase()}` : "Select");

  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-semibold text-slate-700">{label}</span> : null}
      <select className="form-input" {...props}>
        <option value="">{resolvedPlaceholder}</option>
        {options.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>
            {option.label ?? option}
          </option>
        ))}
      </select>
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}
