type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

function FeatureCard({
  icon,
  title,
  description,
}: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md sm:p-7">
      {/* Icon */}
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-2xl transition duration-200 group-hover:bg-slate-900 group-hover:scale-105">
        {icon}
      </div>

      {/* Content */}
      <h3 className="mt-6 text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
        {description}
      </p>

      {/* Decorative line */}
      <div className="mt-6 h-1 w-8 rounded-full bg-slate-200 transition-all duration-200 group-hover:w-12 group-hover:bg-slate-900" />
    </div>
  );
}

export default FeatureCard;