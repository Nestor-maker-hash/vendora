import { supabaseServer } from "@/src/lib/supabaseServer";

export async function getImmortalCustomers() {
  const [ordersResult, businessesResult] = await Promise.all([
    supabaseServer
      .from("orders")
      .select(
        "customer_name, customer_phone, customer_email, total, created_at, business_id"
      )
      .order("created_at", { ascending: false }),

    supabaseServer
      .from("businesses")
      .select("id, name, slug, currency"),
  ]);

  if (ordersResult.error) {
    throw new Error(
      `Failed to load platform customers: ${ordersResult.error.message}`
    );
  }

  if (businessesResult.error) {
    throw new Error(
      `Failed to load customer merchants: ${businessesResult.error.message}`
    );
  }

  const businesses = businessesResult.data ?? [];
  const orders = ordersResult.data ?? [];

  const businessMap = new Map(
    businesses.map((business) => [business.id, business])
  );

  const customerMap = new Map<
    string,
    {
      name: string;
      phone: string;
      email: string | null;
      orders: number;
      totalSpent: number;
      lastOrder: string;
      merchants: Map<
        string,
        {
          name: string;
          currency: string;
          spent: number;
          orders: number;
        }
      >;
    }
  >();

  for (const order of orders) {
    if (!order.customer_phone) {
      continue;
    }

    const phone = order.customer_phone;
    const business = businessMap.get(order.business_id);

    let customer = customerMap.get(phone);

    if (!customer) {
      customer = {
        name: order.customer_name,
        phone,
        email: order.customer_email,
        orders: 0,
        totalSpent: 0,
        lastOrder: order.created_at,
        merchants: new Map(),
      };

      customerMap.set(phone, customer);
    }

    customer.orders += 1;
    customer.totalSpent += Number(order.total ?? 0);

    if (new Date(order.created_at) > new Date(customer.lastOrder)) {
      customer.lastOrder = order.created_at;
    }

    if (!customer.email && order.customer_email) {
      customer.email = order.customer_email;
    }

    if (business) {
      const currency = business.currency ?? "NGN";

      const merchant = customer.merchants.get(business.id);

      if (merchant) {
        merchant.orders += 1;
        merchant.spent += Number(order.total ?? 0);
      } else {
        customer.merchants.set(business.id, {
          name: business.name,
          currency,
          spent: Number(order.total ?? 0),
          orders: 1,
        });
      }
    }
  }

  return Array.from(customerMap.values()).map((customer) => ({
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    orders: customer.orders,
    totalSpent: customer.totalSpent,
    lastOrder: customer.lastOrder,
    merchants: Array.from(customer.merchants.values()),
    merchantCount: customer.merchants.size,
  }));
}
