import { Link } from "react-router-dom";
import Button from "../common/Button";

export default function PageHeader({ title, description, breadcrumbs = [], actionLabel, actionTo, actionIcon, onAction }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.label} className="flex items-center gap-2">
              {crumb.to ? <Link to={crumb.to} className="font-semibold hover:text-brand-600">{crumb.label}</Link> : <span>{crumb.label}</span>}
              {index < breadcrumbs.length - 1 ? <span>/</span> : null}
            </div>
          ))}
        </div>
        <h1 className="text-3xl font-extrabold text-slate-950">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
      </div>
      {actionLabel ? (
        actionTo ? (
          <Link to={actionTo}>
            <Button icon={actionIcon}>{actionLabel}</Button>
          </Link>
        ) : (
          <Button icon={actionIcon} onClick={onAction}>
            {actionLabel}
          </Button>
        )
      ) : null}
    </div>
  );
}
