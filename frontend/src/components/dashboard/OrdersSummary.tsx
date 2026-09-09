interface Props {
  total: number;
  pending: number;
  processing: number;
  delivered: number;
}

export default function OrdersSummary({
  total,
  pending,
  processing,
  delivered,
}: Props) {
  const cards = [
    {
      title: "Total Orders",
      value: total,
      color: "text-slate-800",
      bg: "bg-slate-50",
    },
    {
      title: "Pending",
      value: pending,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      title: "Processing",
      value: processing,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Delivered",
      value: delivered,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="mb-5 grid grid-cols-2 gap-2.5 sm:mb-8 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:shadow-md sm:p-5"
        >
          <div
            className={`inline-flex rounded-lg px-2 py-0.5 text-[10px] font-medium ${card.bg} ${card.color} sm:px-3 sm:py-1 sm:text-xs`}
          >
            {card.title}
          </div>

          <h2
            className={`mt-2 text-2xl font-semibold ${card.color} sm:mt-4 sm:text-3xl`}
          >
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}
