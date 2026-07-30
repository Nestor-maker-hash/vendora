import { getBusinessOrders } from "./getBusinessOrders";

export async function getRecentOrders(limit = 5) {
  return getBusinessOrders({
    limit,
  });
}
