import { supabaseServer } from "@/src/lib/supabaseServer";
import { notifyMerchant } from "@/src/features/notifications/services/notifyMerchant";
import { CartItem } from "@/src/features/cart/types/cart";
import { OrderItem } from "../types/orderItem";
import { getProductById } from "@/src/features/products/services/getProductById";
import { updateProductStock } from "@/src/features/products/services/updateProductStock";
import { checkSubscriptionLimit } from "@/src/features/subscriptions/services/checkSubscriptionLimit";
import { getStorefrontProductAccess } from "@/src/features/subscriptions/services/getStorefrontProductAccess";
import {
  Order,
  PaymentMethod,
} from "../types/order";
import { isStorefrontProductLocked } from "@/src/features/subscriptions/services/isStorefrontProductLocked";
import { createBuyerNotification } from "@/src/features/buyerNotifications/services/createBuyerNotification";
import { BuyerNotificationType } from "@/src/features/buyerNotifications/constants/notificationTypes";

interface CheckoutData {
  businessId: string;

  customerName: string;
  customerPhone: string;
  customerEmail?: string;

  state: string;
  city: string;
  address: string;
  notes?: string;

  deliveryZoneId: string;

  items: CartItem[];
  paymentMethod: PaymentMethod;
}

export async function createOrder(
  data: CheckoutData,
  buyerId: string
): Promise<Order> {
  // Validate products using server-side database values.
  // Never trust price, name, stock, or business_id from the client.
  const validatedItems: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }[] = [];

  for (const item of data.items) {
    const { data: product, error: productError } =
      await supabaseServer
        .from("products")
        .select(
          "id, business_id, name, price, stock, minimum_order_quantity"
        )
        .eq("id", item.id)
        .single();

    if (productError || !product) {
      throw new Error(
        "One of the products in your cart is no longer available."
      );
    }

    // Prevent a product from another merchant being ordered.
    if (product.business_id !== data.businessId) {
      throw new Error(
        `${product.name} is not available in this store.`
      );
    }

    const locked = await isStorefrontProductLocked(
      data.businessId,
      product.id
    );

    if (locked) {
      throw new Error(
        `${product.name} is currently unavailable for purchase.`
      );
    }

    const productAccess =
      await getStorefrontProductAccess(
        data.businessId,
        product.id
      );

    if (!productAccess.allowed) {
      throw new Error(
        `${product.name} is currently unavailable.`
      );
    }

    const minimumOrderQuantity =
      product.minimum_order_quantity ?? 1;

    if (item.quantity < minimumOrderQuantity) {
      throw new Error(
        `${product.name} requires a minimum order of ${minimumOrderQuantity} unit${
          minimumOrderQuantity === 1 ? "" : "s"
        }.`
      );
    }

    // Stock comes from the database, not the browser.
    if (product.stock < item.quantity) {
      throw new Error(
        `${product.name} only has ${product.stock} item(s) left in stock.`
      );
    }

    validatedItems.push({
      productId: product.id,
      productName: product.name,
      price: Number(product.price),
      quantity: item.quantity,
    });
  }

  const subtotal = validatedItems.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const { data: deliveryZone, error: deliveryZoneError } =
    await supabaseServer
      .from("delivery_zones")
      .select("*")
      .eq("id", data.deliveryZoneId)
      .eq("business_id", data.businessId)
      .maybeSingle();

  if (deliveryZoneError) {
    throw deliveryZoneError;
  }

  if (!deliveryZone) {
    throw new Error("Invalid delivery location.");
  }

  const deliveryFee = deliveryZone.free_delivery
    ? 0
    : Number(deliveryZone.price);

  const total = subtotal + deliveryFee;

  // Enforce the merchant's monthly order limit.
  // Orders created during the current UTC calendar month count
  // toward the plan limit regardless of payment/status.
  const now = new Date();

  const monthStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1
    )
  ).toISOString();

  const { count: monthlyOrderCount, error: orderCountError } =
    await supabaseServer
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("business_id", data.businessId)
      .gte("created_at", monthStart);

  if (orderCountError) {
    throw orderCountError;
  }

  const orderLimit = await checkSubscriptionLimit(
    data.businessId,
    "max_orders_per_month",
    monthlyOrderCount ?? 0
  );

  if (!orderLimit.allowed) {
    throw new Error(
      `You've reached the ${orderLimit.planName} plan limit of ${orderLimit.limit} orders this month. Upgrade your plan to continue accepting orders.`
    );
  }

  // Customers are identified by phone number.
  // Existing customers can continue ordering; only a new
  // unique customer consumes a customer slot.
  const { data: existingCustomer, error: existingCustomerError } =
    await supabaseServer
      .from("orders")
      .select("id")
      .eq("business_id", data.businessId)
      .eq("customer_phone", data.customerPhone)
      .limit(1)
      .maybeSingle();

  if (existingCustomerError) {
    throw existingCustomerError;
  }

  if (!existingCustomer) {
    const { data: customerRows, error: customerCountError } =
      await supabaseServer
        .from("orders")
        .select("customer_phone")
        .eq("business_id", data.businessId);

    if (customerCountError) {
      throw customerCountError;
    }

    const uniqueCustomerCount = new Set(
      (customerRows ?? [])
        .map((row) => row.customer_phone)
        .filter(Boolean)
    ).size;

    const customerLimit = await checkSubscriptionLimit(
      data.businessId,
      "max_customers",
      uniqueCustomerCount
    );

    if (!customerLimit.allowed) {
      throw new Error(
        `You've reached the ${customerLimit.planName} plan limit of ${customerLimit.limit} customers. Upgrade your plan to accept orders from new customers.`
      );
    }
  }

  /*
   * The API route has already verified this buyer's Supabase session.
   * Store the buyer profile using the verified user ID, never a client-supplied ID.
   */
  const { error: buyerProfileError } =
    await supabaseServer
      .from("buyer_profiles")
      .upsert(
        {
          id: buyerId,
          full_name: data.customerName,
          email: data.customerEmail ?? null,
          phone: data.customerPhone,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      );

  if (buyerProfileError) {
    throw buyerProfileError;
  }

  /*
   * Final checkout transaction.
   *
   * The database function atomically creates the order,
   * creates its items, and deducts stock for non-online
   * payments. If anything fails, PostgreSQL rolls back
   * the entire transaction.
   *
   * Online payments do not consume stock here. Stock is
   * deducted only after payment is independently verified.
   */
  const { data: order, error: orderError } =
    await supabaseServer.rpc(
      "create_order_atomic",
      {
        p_business_id: data.businessId,
        p_buyer_id: buyerId,

        p_customer_name: data.customerName,
        p_customer_phone: data.customerPhone,
        p_customer_email:
          data.customerEmail ?? null,

        p_state: data.state,
        p_city: data.city,
        p_address: data.address,
        p_notes: data.notes ?? null,

        p_subtotal: subtotal,
        p_delivery_fee: deliveryFee,
        p_total: total,

        p_payment_method: data.paymentMethod,

        p_order_items: validatedItems.map(
          (item) => ({
            product_id: item.productId,
            product_name: item.productName,
            price: item.price,
            quantity: item.quantity,
          })
        ),
      }
    );

  if (orderError) {
    throw orderError;
  }

  if (!order) {
    throw new Error(
      "Order could not be created."
    );
  }

  /*
   * The order transaction has already committed successfully.
   *
   * Buyer notification:
   * The buyer is notified that the order was placed, regardless
   * of payment method. For online payments, this does NOT mean
   * payment was successful; Paystack verification happens separately.
   *
   * Merchant notification:
   * Online-payment orders must NOT notify the merchant yet.
   * The merchant is notified only after Paystack independently
   * verifies the payment and processVerifiedOnlinePayment()
   * atomically finalizes the order.
   *
   * Notification failure must NEVER undo a successfully
   * created order or its stock transaction.
   */
  try {
    const { data: business, error: businessError } =
      await supabaseServer
        .from("businesses")
        .select("name, currency")
        .eq("id", data.businessId)
        .single();

    if (businessError || !business) {
      throw new Error(
        businessError?.message ??
          "Business details could not be loaded."
      );
    }

    try {
      await createBuyerNotification({
        buyerId,
        businessId: data.businessId,
        orderId: order.id,
        title: "Order placed",
        message: `Your order from ${business.name} has been placed successfully.`,
        type: BuyerNotificationType.ORDER_PLACED,
        link: `/buyer/orders/${order.id}`,
      });
    } catch (notificationError) {
      console.error(
        "Buyer order-placed notification failed:",
        notificationError
      );
    }

    if (data.paymentMethod !== "online_payment") {
      try {
        await notifyMerchant(
          order as Order,
          business.currency
        );
      } catch (notificationError) {
        console.error(
          "Merchant notification failed:",
          notificationError
        );
      }
    }
  } catch (notificationSetupError) {
    console.error(
      "Post-order notification setup failed:",
      notificationSetupError
    );
  }

  return order as Order;
}
