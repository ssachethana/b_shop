"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, Tag, Layers, PencilLine } from "lucide-react";
import { useCart } from "./CartContext";
import type { CartItem } from "../../types/sales";
import BatchPickerModal from "./Batchpickermodal";

// ─── UPGRADED: Quantity Input Component ─────────────────────────────────────
// Handles local typing state and allows decimals for weight/volume-based units
function QuantityInput({
  item,
  maxStock,
  setQuantity,
  removeItem,
}: {
  item: CartItem;
  maxStock: number;
  setQuantity: (id: number, qty: number) => void;
  removeItem: (id: number) => void;
}) {
  const [localQty, setLocalQty] = useState<string | number>(item.quantity);

  // Symbols and full names that should allow decimal quantities
  const DECIMAL_UNIT_SYMBOLS = new Set(["kg", "g", "mg", "l", "ml"]);
  const DECIMAL_UNIT_NAMES = new Set([
    "kilogram", "gram", "milligram", "liter", "litre", "milliliter", "millilitre",
  ]);

  const rawUnit = (item.product as any).unit || (item.product as any).uom;

  let symbol = "";
  let name = "";
  if (typeof rawUnit === "string") {
    symbol = rawUnit;
  } else if (rawUnit && typeof rawUnit === "object") {
    symbol = rawUnit.symbol || rawUnit.abbreviation || "";
    name = rawUnit.name || "";
  }

  const normSymbol = symbol.toLowerCase().trim();
  const normName = name.toLowerCase().trim();

  const allowDecimal =
    DECIMAL_UNIT_SYMBOLS.has(normSymbol) || DECIMAL_UNIT_NAMES.has(normName);

  useEffect(() => {
    setLocalQty(item.quantity);
  }, [item.quantity]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQty(val);

    const parsed = allowDecimal ? parseFloat(val) : parseInt(val, 10);

    if (!isNaN(parsed) && parsed > 0) {
      setQuantity(item.product.id, Math.min(parsed, maxStock));
    }
  };

  const handleBlur = () => {
    const parsed = allowDecimal
      ? parseFloat(localQty.toString())
      : parseInt(localQty.toString(), 10);

    if (isNaN(parsed) || parsed <= 0) {
      removeItem(item.product.id);
    } else if (parsed > maxStock) {
      setLocalQty(maxStock);
    } else {
      setLocalQty(parsed);
    }
  };

  return (
    <input
      type="number"
      min="0"
      max={maxStock}
      step={allowDecimal ? "0.001" : "1"}
      value={localQty}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-12 text-center font-bold text-slate-800 bg-transparent border border-transparent hover:border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
    />
  );
}
// ─────────────────────────────────────────────────────────────────────────

interface CartTableProps {
  currency: string;
}

export default function CartTable({ currency }: CartTableProps) {
  // Added `setQuantity` to the destructured context hook
  const { state, increment, decrement, removeItem, setQuantity } = useCart();

  const [editingItem, setEditingItem] = useState<CartItem | null>(null);

  if (state.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-1.5 text-slate-400 p-8">
        <span className="text-4xl">🛒</span>
        <p className="text-sm font-semibold text-slate-500 m-0">No items yet.</p>
        <span className="text-xs">Search or scan a product to start.</span>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-y-auto h-full">
        <table className="w-full border-collapse text-[0.82rem]">
          <thead>
            <tr>
              <th className="text-left px-3 py-2.5 text-[0.72rem] font-bold uppercase tracking-wider text-slate-400 border-b-2 border-slate-100 sticky top-0 bg-white z-10">
                Product
              </th>
              <th className="text-left px-3 py-2.5 text-[0.72rem] font-bold uppercase tracking-wider text-slate-400 border-b-2 border-slate-100 sticky top-0 bg-white z-10">
                Price
              </th>
              <th className="text-left px-3 py-2.5 text-[0.72rem] font-bold uppercase tracking-wider text-slate-400 border-b-2 border-slate-100 sticky top-0 bg-white z-10">
                Qty
              </th>
              <th className="text-right px-3 py-2.5 text-[0.72rem] font-bold uppercase tracking-wider text-slate-400 border-b-2 border-slate-100 sticky top-0 bg-white z-10">
                Total
              </th>
              <th className="w-9 border-b-2 border-slate-100 sticky top-0 bg-white z-10" />
            </tr>
          </thead>
          <tbody>
            {state.items.map((item) => {
              const hasBatches = (item.product.batches?.length ?? 0) > 1;
              const maxStock = item.selectedBatch
                ? item.selectedBatch.remaining
                : item.product.currentStock;

              return (
                <tr
                  key={item.product.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  {/* ── Product ──────────────────────────────────────────── */}
                  <td className="px-3 py-2.5 align-middle min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            width={36}
                            height={36}
                            className="rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-linear-to-br from-indigo-500 to-violet-600 text-white font-bold text-sm flex items-center justify-center">
                            {item.product.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-semibold text-slate-800 truncate max-w-[160px]">
                          {item.product.name}
                        </span>
                        <span className="text-[0.7rem] text-slate-400 font-mono">
                          {item.product.sku}
                        </span>

                        <div className="flex items-center gap-1 flex-wrap">
                          {item.product.activePromotion && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 rounded px-1.5 py-0.5 text-[0.65rem] font-semibold">
                              <Tag size={9} />
                              {item.product.activePromotion.name}
                            </span>
                          )}

                          <button
                            onClick={() => setEditingItem(item)}
                            title={
                              hasBatches
                                ? "Change batch or edit price"
                                : "Edit sell price"
                            }
                            className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[0.65rem] font-semibold transition-colors cursor-pointer border ${
                              item.isPriceOverridden
                                ? "bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200"
                                : hasBatches
                                ? "bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100"
                                : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                            }`}
                          >
                            {item.isPriceOverridden ? (
                              <>
                                <PencilLine size={9} />
                                Price override
                              </>
                            ) : (
                              <>
                                <Layers size={9} />
                                {item.selectedBatch
                                  ? `Batch #${item.selectedBatch.id}`
                                  : "No batch"}
                                {hasBatches && (
                                  <span className="opacity-60">
                                    &nbsp;({item.product.batches.length})
                                  </span>
                                )}
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* ── Price ────────────────────────────────────────────── */}
                  <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                    {item.isPriceOverridden ? (
                      <div className="flex flex-col">
                        <span className="line-through text-slate-400 text-[0.72rem]">
                          {currency} {item.originalPrice.toFixed(2)}
                        </span>
                        <span className="font-bold text-violet-700">
                          {currency} {item.unitPrice.toFixed(2)}
                        </span>
                      </div>
                    ) : item.discountAmount > 0 ? (
                      <div className="flex flex-col">
                        <span className="line-through text-slate-400 text-[0.72rem]">
                          {currency} {item.originalPrice.toFixed(2)}
                        </span>
                        <span className="font-bold text-slate-800">
                          {currency} {item.unitPrice.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-slate-800">
                        {currency} {item.unitPrice.toFixed(2)}
                      </span>
                    )}
                  </td>

                  {/* ── Quantity ─────────────────────────────────────────── */}
                  <td className="px-3 py-2.5 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => decrement(item.product.id)}
                        className="w-6 h-6 rounded-md border-[1.5px] border-slate-200 bg-white flex items-center justify-center text-slate-600 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all"
                        aria-label="Decrease"
                      >
                        <Minus size={12} />
                      </button>
                      
                      {/* Integrated Input Component */}
                      <QuantityInput 
                        item={item} 
                        maxStock={maxStock} 
                        setQuantity={setQuantity} 
                        removeItem={removeItem} 
                      />

                      <button
                        onClick={() => increment(item.product.id)}
                        disabled={item.quantity >= maxStock}
                        className="w-6 h-6 rounded-md border-[1.5px] border-slate-200 bg-white flex items-center justify-center text-slate-600 cursor-pointer hover:bg-slate-100 hover:border-slate-300 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
                        aria-label="Increase"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </td>

                  {/* ── Line total ───────────────────────────────────────── */}
                  <td className="px-3 py-2.5 align-middle whitespace-nowrap text-right">
                    <span className="font-bold text-slate-900">
                      {currency} {item.lineTotal.toFixed(2)}
                    </span>
                  </td>

                  {/* ── Remove ───────────────────────────────────────────── */}
                  <td className="px-2 py-2.5 align-middle w-9">
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-rose-400 hover:text-rose-500 hover:bg-rose-50 p-1 rounded-md flex items-center justify-center transition-colors cursor-pointer border-none bg-transparent"
                      aria-label="Remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Batch / price modal */}
      {editingItem && (
        <BatchPickerModal
          item={editingItem}
          currency={currency}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}