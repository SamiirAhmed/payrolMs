import { classNames } from "../../utils/helpers";

export default function Card({ title, subtitle, action, className, children }) {
  return (
    <section className={classNames("panel p-5 sm:p-6", className)}>
      {(title || subtitle || action) && (
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title ? <h3 className="text-lg font-extrabold text-slate-900">{title}</h3> : null}
            {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
