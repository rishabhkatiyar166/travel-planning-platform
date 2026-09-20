type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-sm font-semibold shadow-sm transition duration-200 focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-50";

  const variantStyles =
    variant === "primary"
      ? "bg-slate-900 text-white hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md focus:ring-slate-200 disabled:hover:translate-y-0"
      : "border border-slate-300 bg-white text-slate-700 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-md focus:ring-slate-100 disabled:hover:translate-y-0";

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseStyles} ${variantStyles}`}
    >
      {children}
    </button>
  );
}

export default Button;