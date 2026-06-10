export default function Input({ label, error, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-semibold text-slate-700">{label}</span> : null}
      <input className="form-input" {...props} />
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}
