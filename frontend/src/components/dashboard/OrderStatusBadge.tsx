interface Props {
  status: string;
}

export default function OrderStatusBadge({
  status,
}: Props) {
  const colors = {
    pending:
      "bg-yellow-100 text-yellow-700",

    processing:
      "bg-blue-100 text-blue-700",

    shipped:
      "bg-purple-100 text-purple-700",

    delivered:
      "bg-emerald-100 text-emerald-700",

    cancelled:
      "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        colors[
          status.toLowerCase() as keyof typeof colors
        ] ??
        "bg-gray-100 text-gray-700"
      }`}
    >
      {status.charAt(0).toUpperCase() +
        status.slice(1)}
    </span>
  );
}
