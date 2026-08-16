import { supabaseServer } from "@/src/lib/supabaseServer";
import { supabase } from "@/src/lib/supabase";
import { CartItem } from "@/src/features/cart/types/cart";
import { OrderItem } from "../types/orderItem";
import { notifyMerchant } from "@/src/features/notifications/services/notifyMerchant";
import { getProductById } from "@/src/features/products/services/getProductById";
import { getBusinessById } from "@/src/features/business/services/getBusinessById";
import { updateProductStock } from "@/src/features/products/services/updateProductStock";
import {
  Order,
  PaymentMethod,
} from "../types/order";

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
  data: CheckoutData
): Promise<Order> {
 // Validate each product before creating the order
for (const item of data.items) {
  const product = await getProductById(item.id);

  const minimumOrderQuantity =
    product.minimum_order_quantity ?? 1;

  // Each product can have its own minimum order quantity.
  // The minimum is not applied to the entire order.
  if (item.quantity < minimumOrderQuantity) {
    throw new Error(
      `${product.name} requires a minimum order of ${minimumOrderQuantity} unit${
        minimumOrderQuantity === 1 ? "" : "s"
      }.`
    );
  }

  // Always validate against the latest stock from the database.
  if (product.stock < item.quantity) {
    throw new Error(
      `${product.name} only has ${product.stock} item(s) left in stock.`
    );
  }
}

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
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

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      business_id: data.businessId,

      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail,

      state: data.state,
      city: data.city,
      address: data.address,
      notes: data.notes,

      subtotal,
      delivery_fee: deliveryFee,
      total,
      payment_method: data.paymentMethod,

      status: "pending",

      payment_status: "pending",

      payment_reference: null,

      paid_at: null,
    })
    .select()
    .single();

  if (error) throw error;

  const orderItems: Omit<
    OrderItem,
    "id" | "created_at"
  >[] = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.id,
    product_name: item.name,
    price: item.price,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems);

  if (itemsError) throw itemsError;

  for (const item of data.items) {
    await updateProductStock(
      item.id,
      -item.quantity
    );
  }

  const business = await getBusinessById(
    data.businessId
  );

  try {
    await notifyMerchant(
      order as Order,
      business.currency
    );
  } catch (err) {
    console.error(
      "Merchant notification failed:",
      err
    );
  }

  return order as Order;
}
