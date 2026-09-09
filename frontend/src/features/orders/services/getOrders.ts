import { getBusinessOrders } from "./getBusinessOrders";

export async function getOrders(
  limit = 20,
  offset = 0
) {
  return getBusinessOrders({
    limit,
    offset,
    withPagination: true,
  });
}
