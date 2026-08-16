"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { Product } from "@/src/features/products/types/product";
import { CartItem } from "../types/cart";

interface CartContextType {
  items: CartItem[];
  cartCount: number;

  storeSlug: string | null;
  setStoreSlug: (slug: string) => void;

  currency: string;
  setCurrency: (currency: string) => void;

  addToCart: (product: Product, quantity?: number) => void;

  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;

  clearCart: () => void;
}

const CartContext =
  createContext<CartContextType | null>(null);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [storeSlug, setStoreSlug] = useState<string | null>(null);
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    const savedItems = localStorage.getItem("vendora-cart");
    const savedSlug = localStorage.getItem("vendora-store");
    const savedCurrency = localStorage.getItem("vendora-currency");

    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }

    if (savedSlug) {
      setStoreSlug(savedSlug);
    }

    if (savedCurrency) {
      setCurrency(savedCurrency);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "vendora-cart",
      JSON.stringify(items)
    );
  }, [items]);

  useEffect(() => {
    if (storeSlug) {
      localStorage.setItem(
        "vendora-store",
        storeSlug
      );
    } else {
      localStorage.removeItem("vendora-store");
    }
  }, [storeSlug]);

  useEffect(() => {
    localStorage.setItem(
      "vendora-currency",
      currency
    );
  }, [currency]);

  function addToCart(
    product: Product,
    requestedQuantity?: number
  ) {
    const minimumQuantity =
      product.minimum_order_quantity ?? 1;

    if (product.stock < minimumQuantity) {
      return;
    }

    const quantity = Math.min(
      Math.max(
        requestedQuantity ?? minimumQuantity,
        minimumQuantity
      ),
      product.stock
    );

    setItems((current) => {
      const existing = current.find(
        (item) => item.id === product.id
     );

      if (existing) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity,
              }
            : item
        );
      }

      return [
        ...current,
        {
          ...product,
          quantity,
        },
      ];
    });
  }

  function increaseQuantity(id: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (item.quantity >= item.stock) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      })
    );
  }

  function decreaseQuantity(id: string) {
    setItems((current) =>
      current.flatMap((item) => {
        if (item.id !== id) {
          return item;
        }

        const minimumQuantity =
          item.minimum_order_quantity ?? 1;

        if (item.quantity <= minimumQuantity) {
          return item;
        }

        return {
          ...item,
          quantity: item.quantity - 1,
        };
      })
    );
  }

  function removeFromCart(id: string) {
    setItems((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    setItems([]);
    setStoreSlug(null);
    setCurrency("");
  }

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount: items.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),

        storeSlug,
        setStoreSlug,

        currency,
        setCurrency,

        addToCart,
        increaseQuantity,
        decreaseQuantity,

        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}

