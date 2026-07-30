import { supabase } from "@/src/lib/supabase";
import { Order } from "@/src/features/orders/types/order";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";

export async function getCustomerByPhone(
  phone: string
) {
  const business = await getCurrentBusiness();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("business_id", business.id)
    .eq("customer_phone", phone)
    .order("created_at", {
      ascending: false,
    });

  if (error) throw error;

  const customerOrders = (orders ?? []) as Order[];

  if (customerOrders.length === 0) {
    return null;
  }

  const totalSpent = customerOrders.reduce(
    (sum, order) => sum + Number(order.total),
    0
  );

  const completedOrders = customerOrders.filter(
    (order) => order.status === "delivered"
  ).length;

  const pendingOrders =
    customerOrders.length - completedOrders;

  return {
    customer: {
      name: customerOrders[0].customer_name,
      phone: customerOrders[0].customer_phone,
      email: customerOrders[0].customer_email,
    },

    stats: {
      totalOrders: customerOrders.length,
      completedOrders,
      pendingOrders,
      totalSpent,
      averageOrderValue:
        totalSpent / customerOrders.length,
      firstOrder:
        customerOrders[
          customerOrders.length - 1
        ].created_at,
      lastOrder: customerOrders[0].created_at,
    },

    orders: customerOrders,
  };
}
