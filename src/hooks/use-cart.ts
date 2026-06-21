"use client";

import { useState, useCallback } from "react";
import type { CartItem } from "@/types/product";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        if (existing.quantity >= existing.maxStock) return prev;
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.variantId === variantId
          ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
          : i
      )
    );
  }, []);

  const updateDiscount = useCallback((variantId: string, discount: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.variantId === variantId ? { ...i, discount: Math.max(0, discount) } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totals = items.reduce(
    (acc, item) => {
      const lineTotal = item.sellPrice * item.quantity - item.discount;
      return {
        subtotal: acc.subtotal + item.sellPrice * item.quantity,
        discount: acc.discount + item.discount,
        total: acc.total + lineTotal,
        itemCount: acc.itemCount + item.quantity,
      };
    },
    { subtotal: 0, discount: 0, total: 0, itemCount: 0 }
  );

  return { items, addItem, removeItem, updateQuantity, updateDiscount, clearCart, totals };
}
