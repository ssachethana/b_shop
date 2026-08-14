"use client";

import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { CartItem, Product, ProductBatch, PaymentMethod } from "../../types/sales";

// ─── Cart helpers ─────────────────────────────────────────────────────────────

function computePromoPrice(
  product: Product,
  batch: ProductBatch | null
): {
  unitPrice: number;
  originalPrice: number;
  discountAmount: number;
} {
  // Use the selected batch's sell price, falling back to the product's default
  const base = (batch?.sellPrice ?? product.sellPrice) ?? 0;
  const promo = product.activePromotion;

  if (!promo) return { unitPrice: base, originalPrice: base, discountAmount: 0 };

  let discount = 0;
  if (promo.discountType === "PERCENT") {
    discount = (base * promo.value) / 100;
  } else {
    discount = promo.value;
  }

  return {
    unitPrice: Math.max(0, base - discount),
    originalPrice: base,
    discountAmount: discount,
  };
}

// ─── State ────────────────────────────────────────────────────────────────────

export interface CartState {
  items: CartItem[];
  paymentMethod: PaymentMethod;
  amountReceived: number;
  customerId: number | null;
  customerName: string;
  discount: number;
}

const initialState: CartState = {
  items: [],
  paymentMethod: "CASH",
  amountReceived: 0,
  customerId: null,
  customerName: "",
  discount: 0,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "ADD_ITEM"; product: Product }
  | { type: "REMOVE_ITEM"; productId: number }
  | { type: "SET_QUANTITY"; productId: number; quantity: number }
  | { type: "INCREMENT"; productId: number }
  | { type: "DECREMENT"; productId: number }
  | { type: "SET_PAYMENT_METHOD"; method: PaymentMethod }
  | { type: "SET_AMOUNT_RECEIVED"; amount: number }
  | { type: "SET_CUSTOMER"; customerId: number | null; name: string }
  | { type: "SET_DISCOUNT"; amount: number }
  /** Pick a batch for a cart line and recompute price from that batch */
  | { type: "SET_BATCH"; productId: number; batch: ProductBatch }
  /** Override the unit price for a line item manually */
  | { type: "SET_PRICE_OVERRIDE"; productId: number; price: number }
  /** Clear a manual price override (revert to batch/promo price) */
  | { type: "CLEAR_PRICE_OVERRIDE"; productId: number }
  | { type: "CLEAR" };

function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    // ── ADD_ITEM ─────────────────────────────────────────────────────────────
    case "ADD_ITEM": {
      const { product } = action;
      const existing = state.items.find((i) => i.product.id === product.id);

      // Default to first available batch
      const defaultBatch = product.batches?.[0] ?? null;
      const { unitPrice, originalPrice, discountAmount } = computePromoPrice(
        product,
        defaultBatch
      );

      if (existing) {
        const newQty = existing.quantity + 1;
        if (newQty > product.currentStock) return state;
        return {
          ...state,
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: newQty, lineTotal: newQty * i.unitPrice }
              : i
          ),
        };
      }

      if (product.currentStock <= 0) return state;

      return {
        ...state,
        items: [
          ...state.items,
          {
            product,
            quantity: 1,
            unitPrice,
            originalPrice,
            discountAmount,
            lineTotal: unitPrice,
            selectedBatch: defaultBatch,
            isPriceOverridden: false,
          },
        ],
      };
    }

    // ── REMOVE_ITEM ──────────────────────────────────────────────────────────
    case "REMOVE_ITEM":
      return {
        ...state,
        items: state.items.filter((i) => i.product.id !== action.productId),
      };

    // ── SET_QUANTITY ─────────────────────────────────────────────────────────
    case "SET_QUANTITY": {
      const { productId, quantity } = action;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.product.id !== productId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === productId
            ? { ...i, quantity, lineTotal: quantity * i.unitPrice }
            : i
        ),
      };
    }

    // ── INCREMENT ────────────────────────────────────────────────────────────
    case "INCREMENT": {
      return {
        ...state,
        items: state.items.map((i) => {
          if (i.product.id !== action.productId) return i;
          const maxStock = i.selectedBatch
            ? i.selectedBatch.remaining
            : i.product.currentStock;
          const newQty = i.quantity + 1;
          if (newQty > maxStock) return i;
          return { ...i, quantity: newQty, lineTotal: newQty * i.unitPrice };
        }),
      };
    }

    // ── DECREMENT ────────────────────────────────────────────────────────────
    case "DECREMENT": {
      const item = state.items.find((i) => i.product.id === action.productId);
      if (!item) return state;
      if (item.quantity <= 1)
        return { ...state, items: state.items.filter((i) => i.product.id !== action.productId) };
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id === action.productId
            ? { ...i, quantity: i.quantity - 1, lineTotal: (i.quantity - 1) * i.unitPrice }
            : i
        ),
      };
    }

    // ── SET_BATCH ─────────────────────────────────────────────────────────────
    case "SET_BATCH": {
      return {
        ...state,
        items: state.items.map((i) => {
          if (i.product.id !== action.productId) return i;

          // Recompute price from the newly selected batch (unless manually overridden)
          if (i.isPriceOverridden) {
            // Keep the override price, just swap the batch reference
            return {
              ...i,
              selectedBatch: action.batch,
            };
          }

          const { unitPrice, originalPrice, discountAmount } = computePromoPrice(
            i.product,
            action.batch
          );

          // Clamp quantity to the selected batch's remaining stock
          const newQty = Math.min(i.quantity, action.batch.remaining);

          return {
            ...i,
            selectedBatch: action.batch,
            unitPrice,
            originalPrice,
            discountAmount,
            quantity: newQty,
            lineTotal: newQty * unitPrice,
            
          };
        }),
      };
    }

    // ── SET_PRICE_OVERRIDE ───────────────────────────────────────────────────
    case "SET_PRICE_OVERRIDE": {
      const price = Math.max(0, action.price);
      return {
        ...state,
        items: state.items.map((i) =>
          i.product.id !== action.productId
            ? i
            : {
                ...i,
                unitPrice: price,
                lineTotal: i.quantity * price,
                isPriceOverridden: true,
              }
        ),
      };
    }

    // ── CLEAR_PRICE_OVERRIDE ─────────────────────────────────────────────────
    case "CLEAR_PRICE_OVERRIDE": {
      return {
        ...state,
        items: state.items.map((i) => {
          if (i.product.id !== action.productId) return i;
          const { unitPrice, originalPrice, discountAmount } = computePromoPrice(
            i.product,
            i.selectedBatch
          );
          return {
            ...i,
            unitPrice,
            originalPrice,
            discountAmount,
            lineTotal: i.quantity * unitPrice,
            isPriceOverridden: false,
          };
        }),
      };
    }

    // ── SET_PAYMENT_METHOD ───────────────────────────────────────────────────
    case "SET_PAYMENT_METHOD":
      return { ...state, paymentMethod: action.method };

    case "SET_AMOUNT_RECEIVED":
      return { ...state, amountReceived: action.amount };

    case "SET_CUSTOMER":
      return { ...state, customerId: action.customerId, customerName: action.name };

    case "SET_DISCOUNT":
      return { ...state, discount: Math.max(0, action.amount) };

    case "CLEAR":
      return { ...initialState };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface CartContextValue {
  state: CartState;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, qty: number) => void;
  increment: (productId: number) => void;
  decrement: (productId: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setAmountReceived: (amount: number) => void;
  setCustomer: (id: number | null, name: string) => void;
  setDiscount: (amount: number) => void;
  setBatch: (productId: number, batch: ProductBatch) => void;
  setPriceOverride: (productId: number, price: number) => void;
  clearPriceOverride: (productId: number) => void;
  clear: () => void;
  // Derived
  subtotal: number;
  cartDiscount: number;
  total: number;
  change: number;
  totalItems: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const subtotal = state.items.reduce((s, i) => s + i.lineTotal, 0);
  
  const cartDiscount = state.discount;
  const total = Math.max(0, subtotal - cartDiscount);
  const change = Math.max(0, state.amountReceived - total);
  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);

  const addItem = useCallback((p: Product) => dispatch({ type: "ADD_ITEM", product: p }), []);
  const removeItem = useCallback((id: number) => dispatch({ type: "REMOVE_ITEM", productId: id }), []);
  const setQuantity = useCallback((id: number, qty: number) => dispatch({ type: "SET_QUANTITY", productId: id, quantity: qty }), []);
  const increment = useCallback((id: number) => dispatch({ type: "INCREMENT", productId: id }), []);
  const decrement = useCallback((id: number) => dispatch({ type: "DECREMENT", productId: id }), []);
  const setPaymentMethod = useCallback((m: PaymentMethod) => dispatch({ type: "SET_PAYMENT_METHOD", method: m }), []);
  const setAmountReceived = useCallback((a: number) => dispatch({ type: "SET_AMOUNT_RECEIVED", amount: a }), []);
  const setCustomer = useCallback((id: number | null, name: string) => dispatch({ type: "SET_CUSTOMER", customerId: id, name }), []);
  const setDiscount = useCallback((a: number) => dispatch({ type: "SET_DISCOUNT", amount: a }), []);
  const setBatch = useCallback((productId: number, batch: ProductBatch) => dispatch({ type: "SET_BATCH", productId, batch }), []);
  const setPriceOverride = useCallback((productId: number, price: number) => dispatch({ type: "SET_PRICE_OVERRIDE", productId, price }), []);
  const clearPriceOverride = useCallback((productId: number) => dispatch({ type: "CLEAR_PRICE_OVERRIDE", productId }), []);
  const clear = useCallback(() => dispatch({ type: "CLEAR" }), []);

  return (
    <CartContext.Provider
      value={{
        state,
        addItem,
        removeItem,
        setQuantity,
        increment,
        decrement,
        setPaymentMethod,
        setAmountReceived,
        setCustomer,
        setDiscount,
        setBatch,
        setPriceOverride,
        clearPriceOverride,
        clear,
        subtotal,
        cartDiscount,
        total,
        change,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}