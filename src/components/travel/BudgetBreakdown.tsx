interface BudgetBreakdownProps {
  budget: string;
}

interface BudgetCategory {
  name: string;
  percentage: number;
}

const categories: BudgetCategory[] = [
  {
    name: "Accommodation",
    percentage: 0.32,
  },
  {
    name: "Food",
    percentage: 0.20,
  },
  {
    name: "Transport",
    percentage: 0.28,
  },
  {
    name: "Activities",
    percentage: 0.12,
  },
  {
    name: "Miscellaneous",
    percentage: 0.08,
  },
];

function BudgetBreakdown({
  budget,
}: BudgetBreakdownProps) {
  // Remove currency symbols, commas and other characters.
  const numericBudget =
    Number(budget.replace(/[^0-9.]/g, "")) || 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totalCalculated = categories.reduce(
    (total, category) =>
      total + numericBudget * category.percentage,
    0
  );

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Financial Overview
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Budget Breakdown
        </h2>

        <p className="mt-2 text-slate-600">
          Estimated spending based on your total trip budget.
        </p>
      </div>

      {/* Total Budget */}
      <div className="mt-6 rounded-xl bg-slate-50 p-5">
        <p className="text-sm text-slate-500">
          Total Budget
        </p>

        <p className="mt-1 text-3xl font-bold text-slate-900">
          {formatCurrency(numericBudget)}
        </p>
      </div>

      {/* Categories */}
      <div className="mt-6 space-y-5">
        {categories.map((category) => {
          const amount =
            numericBudget * category.percentage;

          return (
            <div key={category.name}>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {category.name}
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {formatCurrency(amount)}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-900"
                  style={{
                    width: `${category.percentage * 100}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total Check */}
      <div className="mt-6 flex justify-between border-t border-slate-200 pt-5">
        <span className="font-semibold text-slate-700">
          Estimated Total
        </span>

        <span className="font-bold text-slate-900">
          {formatCurrency(totalCalculated)}
        </span>
      </div>
    </section>
  );
}

export default BudgetBreakdown;