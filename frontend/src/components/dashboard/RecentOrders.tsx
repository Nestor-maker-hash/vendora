const orders = [
  {
    id: "#1001",
    customer: "John Doe",
    total: "₦15,000",
    status: "Pending",
  },
  {
    id: "#1002",
    customer: "Mary Johnson",
    total: "₦8,500",
    status: "Completed",
  },
  {
    id: "#1003",
    customer: "David James",
    total: "₦22,000",
    status: "Processing",
  },
];

export default function RecentOrders() {
  return (
    <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-bold">Recent Orders</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between border-b pb-3"
          >
            <div>
              <p className="font-semibold">{order.customer}</p>
              <p className="text-sm text-gray-500">{order.id}</p>
            </div>

            <div className="text-right">
              <p className="font-semibold">{order.total}</p>
              <p className="text-sm text-emerald-600">
                {order.status}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
