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
    <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.title}
          className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <div
            className={`inline-flex rounded-lg px-3 py-1 text-xs font-medium ${card.bg} ${card.color}`}
          >
            {card.title}
          </div>

          <h2
            className={`mt-4 text-3xl font-semibold ${card.color}`}
          >
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}
