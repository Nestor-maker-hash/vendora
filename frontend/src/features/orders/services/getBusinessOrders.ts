import { supabase } from "@/src/lib/supabase";
import { getCurrentBusiness } from "@/src/features/business/services/getCurrentBusiness";
import { Order } from "../types/order";

interface GetBusinessOrdersOptions {
  limit?: number;
  offset?: number;
  status?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  ascending?: boolean;
  withPagination?: boolean;
}

export interface BusinessOrdersResult {
  orders: Order[];
  hasMore: boolean;
}

export async function getBusinessOrders(
  options: GetBusinessOrdersOptions & {
    withPagination: true;
  }
): Promise<BusinessOrdersResult>;

export async function getBusinessOrders(
  options?: GetBusinessOrdersOptions
): Promise<Order[]>;

export async function getBusinessOrders(
  options: GetBusinessOrdersOptions = {}
): Promise<Order[] | BusinessOrdersResult> {
  const business = await getCurrentBusiness();

  const limit = options.limit;
  const offset = options.offset ?? 0;

  let query = supabase
    .from("orders")
    .select(
      `
        *,
        business:businesses(
          currency
        )
      `,
      options.withPagination
        ? { count: "exact" }
        : undefined
    )
    .eq("business_id", business.id)
    .order("created_at", {
      ascending: options.ascending ?? false,
    });

  if (options.status) {
    query = query.eq("status", options.status);
  }

  if (options.paymentStatus) {
    query = query.eq(
      "payment_status",
      options.paymentStatus
    );
  }

  if (options.paymentMethod) {
    query = query.eq(
      "payment_method",
      options.paymentMethod
    );
  }

  if (limit) {
    query = query.range(
      offset,
      offset + limit - 1
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  const orders = (data ?? []) as Order[];

  if (options.withPagination) {
    return {
      orders,
      hasMore:
        count !== null &&
        offset + orders.length < count,
    };
  }

  return orders;
}
