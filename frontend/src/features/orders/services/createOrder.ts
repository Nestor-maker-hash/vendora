import { supabase } from "@/src/lib/supabase";
import { CartItem } from "@/src/features/cart/types/cart";
import { Order } from "../types/order";
import { OrderItem } from "../types/orderItem";
import { notifyMerchant } from "@/src/features/notifications/services/notifyMerchant";
import { updateProductStock } from "@/src/features/products/services/updateProductStock";
import { getProductById } from "@/src/features/products/services/getProductById";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";

interface CheckoutData {
  businessId: string;

  customerName: string;
  customerPhone: string;
  customerEmail?: string;

  state: string;
  city: string;
  address: string;
  notes?: string;

  deliveryFee: number;

  items: CartItem[];
}

export async function createOrder(
  data: CheckoutData
): Promise<Order> {
// Validate stock before creating the order
for (const item of data.items) {
  const product = await getProductById(item.id);

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

  const total = subtotal + data.deliveryFee;

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
      delivery_fee: data.deliveryFee,
      total,

      status: "pending",
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
const business = await getCurrentBusiness();

await notifyMerchant(
  order as Order,
  business.currency
);
return order as Order;
}
