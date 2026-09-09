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
        <div className="space-y-5 sm:space-y-8">

          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Order Details
            </h1>

            <p className="mt-2 text-gray-500">
              #{order.id}
            </p>
          </div>

          {/* Customer */}

          <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
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

          <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
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

          <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">

            <h2 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
              Ordered Products
            </h2>

            <div className="space-y-3 sm:space-y-4">
              {order.order_items.map((item: OrderItem) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b pb-4"
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

          <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">

            <h2 className="mb-4 text-lg font-semibold sm:mb-6 sm:text-xl">
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

              <div className="flex justify-between text-base font-bold sm:text-lg">
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
	   <div className="rounded-2xl border bg-white p-4 shadow-sm sm:p-6">
  <h2 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
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
