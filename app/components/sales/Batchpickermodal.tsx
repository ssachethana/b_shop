"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Package,
  CalendarClock,
  DollarSign,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  Layers,
  PencilLine,
} from "lucide-react";
import type { CartItem, ProductBatch } from "../../types/sales";
import { useCart } from "./CartContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return "No expiry";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function daysUntilExpiry(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BatchPickerModalProps {
  item: CartItem;
  currency: string;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BatchPickerModal({ item, currency, onClose }: BatchPickerModalProps) {
  const { setBatch, setPriceOverride, clearPriceOverride } = useCart();

  const batches: ProductBatch[] = item.product.batches ?? [];

  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(
    item.selectedBatch?.id ?? batches[0]?.id ?? null
  );

  // Price override state
  const [priceInput, setPriceInput] = useState(
    item.isPriceOverridden ? String(item.unitPrice) : ""
  );
  const [isPriceEditing, setIsPriceEditing] = useState(item.isPriceOverridden);

  const priceRef = useRef<HTMLInputElement>(null);

  // Focus price input when editing starts
  useEffect(() => {
    if (isPriceEditing) priceRef.current?.focus();
  }, [isPriceEditing]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) ?? null;

  function handleApply() {
    // 1. Apply batch change
    if (selectedBatch && selectedBatch.id !== item.selectedBatch?.id) {
      setBatch(item.product.id, selectedBatch);
    }

    // 2. Apply price override (or clear it)
    const parsed = parseFloat(priceInput);
    if (isPriceEditing && !isNaN(parsed) && parsed >= 0) {
      setPriceOverride(item.product.id, parsed);
    } else if (!isPriceEditing && item.isPriceOverridden) {
      clearPriceOverride(item.product.id);
    }

    onClose();
  }

  function handleResetPrice() {
    setPriceInput("");
    setIsPriceEditing(false);
    clearPriceOverride(item.product.id);
  }

  // Effective preview price (what would show if we applied now)
  const batchBasePrice = selectedBatch?.sellPrice ?? item.product.sellPrice ?? 0;
  const promo = item.product.activePromotion;
  let effectivePreviewPrice = batchBasePrice;
  if (!isPriceEditing && promo) {
    const disc =
      promo.discountType === "PERCENT"
        ? (batchBasePrice * promo.value) / 100
        : promo.value;
    effectivePreviewPrice = Math.max(0, batchBasePrice - disc);
  }
  if (isPriceEditing) {
    const p = parseFloat(priceInput);
    if (!isNaN(p)) effectivePreviewPrice = p;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Layers size={18} className="text-indigo-600" />
              </div>
              <div>
                <h2 className="text-[15px] font-extrabold text-slate-900 leading-tight">
                  Batch &amp; Price
                </h2>
                <p className="text-[12px] text-slate-400 mt-0.5 leading-tight">
                  {item.product.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-4 p-5 overflow-y-auto max-h-[70vh]">

            {/* ── Batch list ──────────────────────────────────────────────── */}
            <div>
              <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Package size={12} />
                Available Batches ({batches.length})
              </p>

              {batches.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-center text-slate-400 text-sm">
                  No batches available
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {batches.map((batch) => {
                    const days = daysUntilExpiry(batch.expiryDate);
                    const isSelected = batch.id === selectedBatchId;
                    const isExpiringSoon = days !== null && days <= 30;

                    return (
                      <button
                        key={batch.id}
                        onClick={() => setSelectedBatchId(batch.id)}
                        className={`w-full text-left rounded-xl border-2 p-3.5 transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50/60"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          {/* Left: batch info */}
                          <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[12px] font-mono font-bold text-slate-700">
                                Batch #{batch.id}
                              </span>
                              {item.selectedBatch?.id === batch.id && (
                                <span className="text-[10px] bg-indigo-500 text-white font-semibold rounded-full px-2 py-0.5">
                                  Current
                                </span>
                              )}
                              {isExpiringSoon && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold rounded-full px-2 py-0.5 flex items-center gap-1">
                                  <AlertTriangle size={9} />
                                  {days}d left
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[12px] text-slate-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Package size={11} />
                                {batch.remaining} in stock
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarClock size={11} />
                                {batch.expiryDate
                                  ? formatDate(batch.expiryDate)
                                  : "No expiry"}
                              </span>
                            </div>
                          </div>

                          {/* Right: price + check */}
                          <div className="flex items-center gap-2.5 shrink-0">
                            <div className="text-right">
                              <p className="text-[14px] font-extrabold text-slate-900">
                                {currency} {(batch.sellPrice ?? 0).toFixed(2)}
                              </p>
                              {batch.costPerUnit != null && (
                                <p className="text-[10.5px] text-slate-400">
                                  cost {currency} {batch.costPerUnit.toFixed(2)}
                                </p>
                              )}
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "border-indigo-500 bg-indigo-500"
                                  : "border-slate-300"
                              }`}
                            >
                              {isSelected && (
                                <CheckCircle2 size={13} className="text-white" />
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── Price override ───────────────────────────────────────────── */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-[11.5px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign size={12} />
                Sell Price Override
              </p>

              {!isPriceEditing ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-3">
                  <div>
                    <p className="text-[12px] text-slate-500 mb-0.5">
                      {item.isPriceOverridden
                        ? "Manual override active"
                        : "Using batch / promo price"}
                    </p>
                    <p className="text-[15px] font-extrabold text-slate-900">
                      {currency} {effectivePreviewPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    {item.isPriceOverridden && (
                      <button
                        onClick={handleResetPrice}
                        className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white hover:bg-slate-100 transition-colors"
                      >
                        <RotateCcw size={12} />
                        Reset
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsPriceEditing(true);
                        setPriceInput(String(effectivePreviewPrice));
                      }}
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 hover:text-indigo-700 border border-indigo-200 rounded-lg px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                    >
                      <PencilLine size={12} />
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 rounded-xl border-2 border-indigo-400 bg-indigo-50/40 px-3.5 py-2.5">
                    <span className="text-[13px] font-bold text-indigo-400 shrink-0">
                      {currency}
                    </span>
                    <input
                      ref={priceRef}
                      type="number"
                      min={0}
                      step="0.01"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleApply();
                        if (e.key === "Escape") setIsPriceEditing(false);
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-[15px] font-extrabold text-slate-900 placeholder:text-slate-400"
                      placeholder="0.00"
                    />
                    <button
                      onClick={() => setIsPriceEditing(false)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 px-1">
                    This overrides the batch price for this line only.
                  </p>
                </div>
              )}
            </div>

            {/* ── Preview summary ──────────────────────────────────────────── */}
            <div className="rounded-xl bg-slate-900 text-white p-3.5 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] text-slate-400 mb-0.5">Preview line total</p>
                <p className="text-[16px] font-extrabold">
                  {currency} {(effectivePreviewPrice * item.quantity).toFixed(2)}
                </p>
              </div>
              <div className="text-right text-[12px] text-slate-400">
                <p>
                  {currency} {effectivePreviewPrice.toFixed(2)}{" "}
                  × {item.quantity} {item.product.unit?.symbol ?? ""}
                </p>
                {selectedBatch && (
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Batch #{selectedBatch.id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2.5 p-5 pt-4 border-t border-slate-100 shrink-0">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl border-2 border-slate-200 bg-white text-slate-600 text-[13.5px] font-bold py-2.5 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-1 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 text-white text-[13.5px] font-extrabold py-2.5 hover:opacity-90 transition-opacity shadow-md shadow-indigo-500/30"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}