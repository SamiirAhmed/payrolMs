export default function FormSection({ title, description, children }) {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
      <div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
