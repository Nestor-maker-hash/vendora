import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalMerchant(
  businessId: string
) {
  const [
    businessResult,
    productsResult,
    ordersResult,
    customersResult,
    subscriptionResult,
    notificationsResult,
    pushSubscriptionsResult,
  ] = await Promise.all([
    supabaseServer
      .from("businesses")
      .select("*")
      .eq("id", businessId)
      .maybeSingle(),

    supabaseServer
      .from("products")
      .select(
        "id, name, description, price, stock, minimum_order_quantity, image_url, created_at"
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),

    supabaseServer
      .from("orders")
      .select(
        "id, customer_name, customer_phone, customer_email, state, city, address, subtotal, delivery_fee, total, status, payment_method, payment_status, payment_reference, paid_at, created_at"
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),

    supabaseServer
      .from("orders")
      .select(
        "customer_name, customer_phone, customer_email, total, created_at"
      )
      .eq("business_id", businessId),

    supabaseServer
      .from("business_subscriptions")
      .select(
        "id, plan_id, status, started_at, expires_at, created_at"
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabaseServer
      .from("notifications")
      .select(
        "id, title, message, type, link, is_read, created_at"
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(20),

    supabaseServer
      .from("push_subscriptions")
      .select(
        "id, endpoint, platform, user_agent, is_active, last_used_at, created_at, updated_at"
      )
      .eq("business_id", businessId)
      .order("last_used_at", { ascending: false }),
  ]);

  if (businessResult.error) {
    throw new Error(
      `Failed to load merchant: ${businessResult.error.message}`
    );
  }

  if (!businessResult.data) {
    return null;
  }

  if (productsResult.error) {
    throw new Error(
      `Failed to load merchant products: ${productsResult.error.message}`
    );
  }

  if (ordersResult.error) {
    throw new Error(
      `Failed to load merchant orders: ${ordersResult.error.message}`
    );
  }

  if (customersResult.error) {
    throw new Error(
      `Failed to load merchant customers: ${customersResult.error.message}`
    );
  }

  if (subscriptionResult.error) {
    throw new Error(
      `Failed to load merchant subscription: ${subscriptionResult.error.message}`
    );
  }

  if (notificationsResult.error) {
    throw new Error(
      `Failed to load merchant notifications: ${notificationsResult.error.message}`
    );
  }

  if (pushSubscriptionsResult.error) {
    throw new Error(
      `Failed to load merchant devices: ${pushSubscriptionsResult.error.message}`
    );
  }

  const products = productsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const subscription = subscriptionResult.data;

  let subscriptionPlan = null;

  if (subscription?.plan_id) {
    const { data: plan, error: planError } =
      await supabaseServer
        .from("subscription_plans")
        .select(
          "id, name, monthly_price, yearly_price"
        )
        .eq("id", subscription.plan_id)
        .maybeSingle();

    if (planError) {
      throw new Error(
        `Failed to load subscription plan: ${planError.message}`
      );
    }

    subscriptionPlan = plan;
  }

  const customerOrders = customersResult.data ?? [];
  const notifications = notificationsResult.data ?? [];
  const devices = pushSubscriptionsResult.data ?? [];

  const customers = Array.from(
    new Map(
      customerOrders
        .filter((order) => order.customer_phone)
        .map((order) => [
          order.customer_phone,
          {
            name: order.customer_name,
            phone: order.customer_phone,
            email: order.customer_email,
            orders: 0,
            totalSpent: 0,
            lastOrder: order.created_at,
          },
        ])
    ).values()
  );

  for (const customer of customers) {
    const customerOrdersForPerson =
      customerOrders.filter(
        (order) =>
          order.customer_phone === customer.phone
      );

    customer.orders = customerOrdersForPerson.length;

    customer.totalSpent =
      customerOrdersForPerson.reduce(
        (sum, order) =>
          sum + Number(order.total ?? 0),
        0
      );

    customer.lastOrder =
      customerOrdersForPerson
        .map((order) => order.created_at)
        .sort()
        .at(-1) ?? customer.lastOrder;
  }

  const revenue = orders.reduce(
    (sum, order) =>
      sum + Number(order.total ?? 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) =>
      order.status === "pending" ||
      order.payment_status === "pending"
  ).length;

  const lowStockProducts = products.filter(
    (product) => product.stock <= 5
  ).length;

  const unreadNotifications =
    notifications.filter(
      (notification) => !notification.is_read
    ).length;

  const activeDevices = devices.filter(
    (device) => device.is_active
  ).length;

  return {
    business: businessResult.data,
    products,
    orders,
    customers,
    subscription: subscription
      ? {
          ...subscription,
          subscription_plans: subscriptionPlan,
        }
      : null,
    notifications,
    devices,

    stats: {
      products: products.length,
      orders: orders.length,
      customers: customers.length,
      revenue,
      pendingOrders,
      lowStockProducts,
      unreadNotifications,
      activeDevices,
    },
  };
}

