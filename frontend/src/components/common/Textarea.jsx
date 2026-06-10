export default function Textarea({ label, error, ...props }) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-semibold text-slate-700">{label}</span> : null}
      <textarea className="form-input min-h-28 resize-none" {...props} />
      {error ? <span className="text-xs font-medium text-rose-600">{error}</span> : null}
    </label>
  );
}
