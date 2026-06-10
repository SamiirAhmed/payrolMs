import { classNames } from "../../utils/helpers";

const variants = {
  primary: "bg-brand-600 text-white hover:bg-brand-700",
  secondary: "bg-slate-900 text-white hover:bg-slate-800",
  outline: "border border-slate-200 bg-white text-slate-700 hover:border-brand-200 hover:text-brand-700",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  danger: "bg-rose-600 text-white hover:bg-rose-700"
};

export default function Button({
  children,
  variant = "primary",
  className,
  loading = false,
  icon: Icon,
  iconOnly = false,
  ...props
}) {
  return (
    <button
      className={classNames(
        "inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        iconOnly ? "h-10 w-10" : "px-4 py-3",
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon ? <Icon className="text-base" /> : null}
      {iconOnly ? null : loading ? "Please wait..." : children}
    </button>
  );
}
