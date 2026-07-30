"use client";

import Link from "next/link";
import { useCart } from "@/src/features/cart/context/CartContext";
import StoreNavbar from "@/src/components/store/StoreNavbar";
import { formatCurrency } from "@/src/utils/formatCurrency";

export default function CartPage() {
  const {
  items,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  storeSlug,
  currency,
} = useCart();

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

return (
  <>
<StoreNavbar
  storeName="Vendora"
  storeHref={storeSlug ? `/store/${storeSlug}` : "/"}
/>
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl p-6">

      <h1 className="mb-8 text-4xl font-bold">
        Shopping Cart
      </h1>

      {items.length === 0 ? (
        <div className="rounded-xl border p-10 text-center">
          <h2 className="text-2xl font-semibold">
            Your cart is empty
          </h2>

         <Link
  href={storeSlug ? `/store/${storeSlug}` : "/"}
  className="mt-6 inline-block font-medium text-emerald-600 hover:underline"
>
  ← Continue Shopping
</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border p-4"
              >
                <img
                  src={item.image_url ?? "/placeholder.png"}
                  alt={item.name}
                  className="h-24 w-24 rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h2 className="font-semibold">
                    {item.name}
                  </h2>

                  <div className="mt-2 flex items-center gap-3">

  <button
    onClick={() => decreaseQuantity(item.id)}
    className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-100"
  >
    −
  </button>

  <span className="min-w-6 text-center font-medium">
    {item.quantity}
  </span>

  <button
    onClick={() => increaseQuantity(item.id)}
    className="flex h-8 w-8 items-center justify-center rounded-lg border hover:bg-gray-100"
  >
    +
  </button>

</div>

   <p className="font-bold text-emerald-600">
  {formatCurrency(item.price * item.quantity, currency)}
</p>

                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="rounded-lg bg-red-100 px-4 py-2 text-red-600"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border p-6">
            <h2 className="text-2xl font-bold">
              Total
            </h2>

       <p className="mt-2 text-3xl font-bold text-emerald-600">
  {formatCurrency(total, currency)}
</p>

            <Link
  href="/checkout"
  className="mt-6 block w-full rounded-xl bg-emerald-600 py-4 text-center font-medium text-white transition hover:bg-emerald-700"
>
  Proceed to Checkout
</Link>

            <button
              onClick={clearCart}
              className="mt-4 w-full rounded-xl border py-4"
            >
              Clear Cart
            </button>
          </div>
        </>
      )}
</div>
    </main>
  </>
  );
}
