"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  LayoutGrid,
  Trash2,
  Tag,
  UserRound,
  BadgePercent,
} from "lucide-react";
import type { Product, Customer } from "../../types/sales";
import { CartProvider, useCart } from "../../components/sales/CartContext";
import CartTable from "../../components/sales/CartTable";
import ProductGrid from "../../components/sales/ProductGrid";
import Numpad from "../../components/sales/Numpad";
import ScannerInput from "../../components/sales/ScannerInput";
import CheckoutModal from "../../components/sales/CheckoutModal";
import ReceiptModal from "../../components/sales/ReceiptModal";
import { useSession } from 'next-auth/react';



// ─── Constants ───────────────────────────────────────────────────────────────
const SHOP_ID = 2;
const CASHIER_ID = 1;
const CURRENCY = "USD";

// ─── Inner page (needs cart context) ─────────────────────────────────────────
function SalesInner() {
  const cart = useCart();

  // Data
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // UI state
  const [view, setView] = useState<"products" | "cart">("products"); // mobile tab
  const [showCheckout, setShowCheckout] = useState(false);
  const [successSaleId, setSuccessSaleId] = useState<number | null>(null);
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);
  const [customerQuery, setCustomerQuery] = useState("");
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountInput, setDiscountInput] = useState("");

  // Load products
  useEffect(() => {
    fetch(`/api/sales?shopId=${SHOP_ID}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products ?? []))
      .catch(console.error)
      .finally(() => setIsLoadingProducts(false));
  }, []);

  // Customer search
  useEffect(() => {
    if (!showCustomerSearch) return;
    const t = setTimeout(() => {
      fetch(`/api/sales/customers?shopId=${SHOP_ID}&q=${encodeURIComponent(customerQuery)}`)
        .then((r) => r.json())
        .then((d) => setCustomers(d.customers ?? []))
        .catch(console.error);
    }, 300);
    return () => clearTimeout(t);
  }, [customerQuery, showCustomerSearch]);

  function applyDiscount() {
    const n = parseFloat(discountInput);
    if (!isNaN(n)) cart.setDiscount(n);
    setShowDiscount(false);
  }

  function handleSuccess(saleId: number) {
    setShowCheckout(false);
    setSuccessSaleId(saleId);
  }

  function handleNewSale() {
    setSuccessSaleId(null);
    setDiscountInput("");
    setShowDiscount(false);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 font-sans antialiased selection:bg-indigo-200">
      
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center gap-4 bg-slate-900 text-white px-3.5 py-3 sm:px-5 shrink-0">
        <div className="flex items-center gap-2 font-extrabold text-[15px] shrink-0">
          <ShoppingCart size={20} />
          <span className="hidden sm:inline">Point of Sale</span>
        </div>

        {/* Customer picker */}
        <div className="flex-1 relative">
          {cart.state.customerName ? (
            <div className="inline-flex items-center gap-1.5 bg-indigo-500/25 border border-indigo-500/50 rounded-lg px-2 py-1 text-[12.5px] font-semibold text-indigo-200">
              <UserRound size={13} />
              <span>{cart.state.customerName}</span>
              <button onClick={() => cart.setCustomer(null, "")} className="border-none bg-none text-indigo-300 cursor-pointer text-16 leading-none ml-1 hover:text-white">×</button>
            </div>
          ) : (
            <button className="flex items-center gap-1.5 border-[1.5px] border-dashed border-white/25 rounded-lg bg-transparent text-white/70 text-[12.5px] font-semibold px-2.5 py-1.25 cursor-pointer transition-all hover:border-white/50 hover:text-white" onClick={() => setShowCustomerSearch((v) => !v)}>
              <UserRound size={14} />
              <span className="hidden sm:inline">Add Customer</span>
            </button>
          )}

          {/* Customer dropdown */}
          {showCustomerSearch && (
            <div className="absolute top-[calc(100%+8px)] left-0 bg-white rounded-xl w-[280px] shadow-xl z-50 overflow-hidden border border-slate-100">
              <input
                className="w-full border-none border-b border-slate-100 px-3.5 py-2.5 text-[13px] text-slate-800 outline-none placeholder:text-slate-400"
                placeholder="Search by name or phone…"
                value={customerQuery}
                onChange={(e) => setCustomerQuery(e.target.value)}
                autoFocus
              />
              <div className="max-h-[220px] overflow-y-auto">
                {customers.length === 0 ? (
                  <div className="px-3.5 py-3 text-[13px] text-slate-400">No customers found</div>
                ) : (
                  customers.map((c) => (
                    <button
                      key={c.id}
                      className="w-full border-none bg-none text-left px-3.5 py-2.5 cursor-pointer flex flex-col gap-0.5 transition-colors hover:bg-slate-50"
                      onClick={() => {
                        cart.setCustomer(c.id, c.name);
                        setShowCustomerSearch(false);
                        setCustomerQuery("");
                      }}
                    >
                      <span className="text-[13.5px] font-semibold text-slate-800">{c.name}</span>
                      {c.phone && <span className="text-[11.5px] text-slate-400">{c.phone}</span>}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cart summary on mobile */}
        <div className="sm:hidden relative cursor-pointer text-white/80 hover:text-white" onClick={() => setView("cart")}>
          <ShoppingCart size={18} />
          {cart.totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-indigo-500 text-white rounded-full w-4 h-4 text-[9.5px] font-extrabold flex items-center justify-center">
              {cart.totalItems}
            </span>
          )}
        </div>
      </header>

      {/* ── Mobile tab bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden bg-white border-b border-slate-200 shrink-0">
        <button
          className={`flex-1 border-none bg-none p-2.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
            view === "products" ? "text-indigo-600 border-indigo-600" : "text-slate-400 border-transparent"
          }`}
          onClick={() => setView("products")}
        >
          <LayoutGrid size={15} /> Products
        </button>
        <button
          className={`flex-1 border-none bg-none p-2.5 text-[13px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer border-b-2 transition-colors ${
            view === "cart" ? "text-indigo-600 border-indigo-600" : "text-slate-400 border-transparent"
          }`}
          onClick={() => setView("cart")}
        >
          <ShoppingCart size={15} /> Cart
          {cart.totalItems > 0 && (
            <span className="bg-indigo-500 text-white rounded-full w-4 h-4 text-[9.5px] font-extrabold flex items-center justify-center">
              {cart.totalItems}
            </span>
          )}
        </button>
      </div>

      {/* ── Main layout ─────────────────────────────────────────────────── */}
     <main className="grid grid-cols-1 md:grid-cols-[2fr_1fr] flex-1 min-h-0 overflow-hidden sm:overflow-visible">
        
        {/* Left: Products */}
        <section className={`flex flex-col overflow-hidden bg-white md:border-r border-slate-100 p-4 gap-3 ${
          view === "products" ? "flex" : "hidden sm:flex"
        } max-sm:h-[calc(100vh-96px)]`}>
          <div className="shrink-0">
            <ScannerInput shopId={SHOP_ID} currency={CURRENCY} />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ProductGrid
              products={products}
              currency={CURRENCY}
              isLoading={isLoadingProducts}
            />
          </div>
        </section>

        {/* Right: Cart + Payment */}
        <section className={`flex flex-col overflow-hidden bg-slate-50 p-4 gap-2.5 md:border-l-0 border-t border-slate-200 md:border-t-0 ${
          view === "cart" ? "flex" : "hidden sm:flex"
        } max-sm:h-[calc(100vh-96px)]`}>
          
          {/* Cart header */}
          <div className="flex items-center justify-between shrink-0">
            <span className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
              Order
              {cart.totalItems > 0 && (
                <span className="bg-indigo-500 text-white rounded-full text-[11px] px-2 py-0.5 font-bold">
                  {cart.totalItems} items
                </span>
              )}
            </span>
            <div className="flex gap-1.5">
              <button
                className="border-[1.5px] border-slate-200 rounded-lg bg-white text-slate-500 w-8 h-8 flex items-center justify-center cursor-pointer transition-colors hover:bg-slate-100"
                onClick={() => setShowDiscount((v) => !v)}
                title="Add discount"
              >
                <BadgePercent size={16} />
              </button>
              {cart.state.items.length > 0 && (
                <button
                  className="border-[1.5px] border-slate-200 rounded-lg bg-white text-rose-400 w-8 h-8 flex items-center justify-center cursor-pointer transition-colors hover:bg-rose-50 hover:border-rose-200 hover:text-rose-500"
                  onClick={cart.clear}
                  title="Clear cart"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Discount input */}
          {showDiscount && (
            <div className="flex items-center gap-1.5 shrink-0 bg-white border-[1.5px] border-amber-400 rounded-xl px-2.5 py-1.5">
              <Tag size={14} className="text-amber-500 shrink-0" />
              <input
                className="flex-1 border-none outline-none bg-transparent text-[13.5px] text-slate-800 placeholder:text-slate-400"
                type="number"
                min={0}
                placeholder="Discount amount"
                value={discountInput}
                onChange={(e) => setDiscountInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && applyDiscount()}
              />
              <button className="border-none bg-amber-500 text-white rounded-md text-[11.5px] font-bold px-2 py-1 cursor-pointer hover:bg-amber-600 transition-colors" onClick={applyDiscount}>Apply</button>
              <button className="border-none bg-none text-slate-400 text-lg cursor-pointer px-1 hover:text-slate-600" onClick={() => setShowDiscount(false)}>×</button>
            </div>
          )}

          {/* Cart items */}
          <div className="flex-1 min-h-0 bg-white rounded-xl border-[1.5px] border-slate-100 overflow-hidden">
            <CartTable currency={CURRENCY} />
          </div>

          {/* Cart totals */}
          <div className="bg-white rounded-xl border-[1.5px] border-slate-100 p-2.5 px-3.5 flex flex-col gap-1.5 shrink-0">
            {cart.cartDiscount > 0 && (
              <div className="flex justify-between text-[13px] text-slate-500">
                <span>Discount</span>
                <span className="text-emerald-600">− {CURRENCY} {cart.cartDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1.5 border-t-[1.5px] border-slate-100">
              <span>Total</span>
              <span>{CURRENCY} {cart.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Numpad */}
          <div className="shrink-0 hidden sm:block">
            <Numpad currency={CURRENCY} />
          </div>

          {/* Checkout button */}
          <button
            className="border-none rounded-xl p-3.5 bg-[#F5A623] text-white text-[15px] font-extrabold cursor-pointer transition-opacity shadow-lg shadow-indigo-500/35 shrink-0 disabled:opacity-45 disabled:cursor-not-allowed enabled:hover:opacity-90"
            disabled={cart.state.items.length === 0}
            onClick={() => setShowCheckout(true)}
          >
            Confirm Sale · {CURRENCY} {cart.total.toFixed(2)}
          </button>
        </section>
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onSuccess={handleSuccess}
          shopId={SHOP_ID}
          cashierId={CASHIER_ID}
          currency={CURRENCY}
        />
      )}
      {successSaleId !== null && (
        <ReceiptModal
          saleId={successSaleId}
          currency={CURRENCY}
          onNewSale={handleNewSale}
          onPrint={() => window.print()}
        />
      )}
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────
export default function SalesPage() {
  return (
    <CartProvider>
      <SalesInner />
    </CartProvider>
  );
}