import AuthGuard from "@/src/components/AuthGuard";
import DashboardLayout from "@/src/components/layout/DashboardLayout";
import { getOrderById } from "@/src/features/orders/services/getOrderById";
import OrderActions from "@/src/components/dashboard/OrderActions";
import { OrderItem } from "@/src/features/orders/types/orderItem";
import { formatCurrency } from "@/src/utils/formatCurrency";
import PaymentVerification from "@/src/features/orders/components/PaymentVerification";

interface Props {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function OrderDetailsPage({
  params,
}: Props) {
  const { orderId } = await params;

const order = await getOrderById(orderId);

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="space-y-8">

          <div>
            <h1 className="text-3xl font-bold">
              Order Details
            </h1>

            <p className="mt-2 text-gray-500">
              #{order.id}
            </p>
          </div>

          {/* Customer */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              Customer
            </h2>

            <div className="space-y-2">
              <p><strong>Name:</strong> {order.customer_name}</p>
              <p><strong>Phone:</strong> {order.customer_phone}</p>

              {order.customer_email && (
                <p>
                  <strong>Email:</strong> {order.customer_email}
                </p>
              )}
            </div>
          </div>

          {/* Delivery */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-semibold">
              Delivery Address
            </h2>

            <p>
              {order.address}
            </p>

            <p>
              {order.city}, {order.state}
            </p>

            {order.notes && (
              <>
                <h3 className="mt-5 font-semibold">
                  Notes
                </h3>

                <p className="text-gray-600">
                  {order.notes}
                </p>
              </>
            )}
          </div>

          {/* Items */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-semibold">
              Ordered Products
            </h2>

            <div className="space-y-4">
              {order.order_items.map((item: OrderItem) => (
                <div
                  key={item.id}
                  className="flex justify-between border-b pb-4"
                >
                  <div>
                    <p className="font-semibold">
                      {item.product_name}
                    </p>

                    <p className="text-sm text-gray-500">
                      Qty {item.quantity}
                    </p>
                  </div>

                  <p className="font-semibold">
                    {formatCurrency(
  Number(item.price),
  order.business.currency
)}
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Totals */}

          <div className="rounded-2xl border bg-white p-6 shadow-sm">

            <h2 className="mb-6 text-xl font-semibold">
              Payment Summary
            </h2>

            <div className="space-y-3">

              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>
                {formatCurrency(
  Number(order.subtotal),
  order.business.currency
)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Delivery</span>
                <span>
                  {formatCurrency(
  Number(order.delivery_fee),
  order.business.currency
)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>

                <span className="text-emerald-600">
              {formatCurrency(
  Number(order.total),
  order.business.currency
)}
                </span>
              </div>

            </div>

          </div>
<PaymentVerification order={order} />
	   <div className="rounded-2xl border bg-white p-6 shadow-sm">
  <h2 className="mb-4 text-xl font-semibold">
    Order Actions
  </h2>

  <OrderActions
    orderId={order.id}
    status={order.status}
  />
</div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
