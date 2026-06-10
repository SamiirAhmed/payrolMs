export default function InfoList({ items, columns = 2 }) {
  return (
    <div className={`grid gap-4 ${columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">{item.label}</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
