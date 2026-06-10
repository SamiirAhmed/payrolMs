import Button from "./Button";

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="panel-muted flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
      <div className="rounded-full bg-brand-50 p-4 text-brand-600">
        <span className="text-2xl">+</span>
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="max-w-md text-sm text-slate-500">{description}</p>
      {actionLabel ? (
        <Button variant="outline" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
