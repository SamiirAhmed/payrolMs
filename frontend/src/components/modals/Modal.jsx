import { classNames } from "../../utils/helpers";

export default function Modal({ open, title, description, onClose, children, panelClassName, bodyClassName }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="flex min-h-full items-start justify-center py-4 sm:py-8">
        <div className={classNames("panel flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden p-0", panelClassName)}>
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{title}</h3>
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-slate-500">
            Close
          </button>
          </div>
          <div className={classNames("overflow-y-auto px-5 py-5 sm:px-6", bodyClassName)}>{children}</div>
        </div>
      </div>
    </div>
  );
}
