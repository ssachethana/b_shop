'use client';

// components/product/BatchesTab.tsx
import React, { useState, useEffect } from 'react';
import type { Batch, BatchForm } from '../../../types/product-types'; // adjust path as needed
import { BATCH_FORM_DEFAULT } from '../../../types/product-types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (v: number | string | null | undefined): string =>
  v !== null && v !== undefined && !isNaN(Number(v))
    ? Number(v).toFixed(2)
    : '0.00';

const fmtDate = (d: string): string =>
  new Date(d).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

// ─── Small presentational sub-components ──────────────────────────────────────

function StatusPill({ pct }: { pct: number }) {
  const color =
    pct === 0
      ? 'bg-red-100 text-red-600'
      : pct < 30
      ? 'bg-amber-100 text-amber-700'
      : 'bg-emerald-100 text-emerald-700';
  const label = pct === 0 ? 'Empty' : pct < 30 ? 'Low' : 'In Stock';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

function StockBar({ pct }: { pct: number }) {
  const fill =
    pct === 0 ? 'bg-red-400' : pct < 30 ? 'bg-amber-400' : 'bg-emerald-500';
  return (
    <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
      <div
        className={`h-full ${fill} rounded-full transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── AddBatchForm ─────────────────────────────────────────────────────────────

interface AddBatchFormProps {
  productId: number;
  shopId: number;
  onSuccess: (newBatch: Batch) => void;
  onClose: () => void;
}

function AddBatchForm({ productId, shopId, onSuccess, onClose }: AddBatchFormProps) {
  const [form, setForm]       = useState<BatchForm>(BATCH_FORM_DEFAULT);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const inputCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 ' +
    'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/products/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          shopId,
          quantity:    form.quantity,
          costPerUnit: form.costPerUnit,
          sellPrice:   form.sellPrice   || null,
          expiryDate:  form.expiryDate  || null,
          supplierId:  form.supplierId  || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create batch');
      }

      const newBatch: Batch = await res.json();
      onSuccess(newBatch);
      onClose();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const isSubmitDisabled = saving || !form.quantity || !form.costPerUnit;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
        New Purchase Batch
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2.5 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            className={inputCls}
            placeholder="e.g. 100"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Cost Per Unit <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">LKR</span>
            <input
              name="costPerUnit"
              type="number"
              min="0"
              step="0.01"
              value={form.costPerUnit}
              onChange={handleChange}
              className={`${inputCls} pl-11`}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Selling Price <span className="text-gray-400">(optional)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">LKR</span>
            <input
              name="sellPrice"
              type="number"
              min="0"
              step="0.01"
              value={form.sellPrice}
              onChange={handleChange}
              className={`${inputCls} pl-11`}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Expiry Date <span className="text-gray-400">(optional)</span>
          </label>
          <input
            name="expiryDate"
            type="date"
            value={form.expiryDate}
            onChange={handleChange}
            className={inputCls}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">
            Supplier ID <span className="text-gray-400">(optional)</span>
          </label>
          <input
            name="supplierId"
            type="number"
            min="1"
            value={form.supplierId}
            onChange={handleChange}
            className={inputCls}
            placeholder="Supplier ID"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 mt-5 pt-4 border-t border-orange-200">
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg
                     hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm"
        >
          {saving ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Add Batch
            </>
          )}
        </button>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── BatchesTable ─────────────────────────────────────────────────────────────

interface BatchesTableProps {
  batches: Batch[];
  unitSymbol: string;
}

function BatchesTable({ batches, unitSymbol }: BatchesTableProps) {
  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
        <p className="text-sm font-medium">No batches yet</p>
        <p className="text-xs mt-1">
          Click <span className="font-semibold text-orange-500">Add Batch</span> to record your first purchase
        </p>
      </div>
    );
  }

  const totalStock     = batches.reduce((s, b) => s + (Number(b.remaining) || 0), 0);
  const totalPurchased = batches.reduce((s, b) => s + (Number(b.quantity) || 0), 0);
  const HEADERS = ['Batch #', 'Purchased', 'Qty', 'Remaining', 'Stock', 'Cost/Unit', 'Sell Price', 'Expiry', 'Supplier'];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {HEADERS.map(h => (
              <th
                key={h}
                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {batches.map((batch, i) => {
            const qty = Number(batch.quantity);
            const remaining = Number(batch.remaining);
            const pct = qty > 0 ? Math.round((remaining / qty) * 100) : 0;
          
            const isExpired = batch.expiryDate && new Date(batch.expiryDate) < new Date();

            return (
              <tr
                key={batch.id}
                className={`hover:bg-gray-50 transition-colors ${i % 2 !== 0 ? 'bg-gray-50/40' : ''}`}
              >
                <td className="px-4 py-3.5 font-mono text-xs text-gray-500">#{batch.id}</td>
                <td className="px-4 py-3.5 text-gray-700 whitespace-nowrap">{fmtDate(batch.purchasedAt)}</td>
                <td className="px-4 py-3.5 font-semibold text-gray-900">{qty}</td>
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-gray-900">{remaining}</span>
                  <span className="text-gray-400 text-xs ml-1">/ {qty}</span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <StockBar pct={pct} />
                    <StatusPill pct={pct} />
                  </div>
                </td>
                <td className="px-4 py-3.5 font-semibold text-gray-900">LKR {fmt(batch.costPerUnit)}</td>
                <td className="px-4 py-3.5 font-semibold text-gray-900">
                  {batch.sellPrice != null
                    ? `LKR ${fmt(batch.sellPrice)}`
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  {batch.expiryDate ? (
                    <span className={`text-xs font-medium ${isExpired ? 'text-red-600' : 'text-gray-700'}`}>
                      {isExpired && '⚠ '}{fmtDate(batch.expiryDate)}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-gray-700">
                  {batch.supplier?.name ?? <span className="text-gray-400">—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center gap-6 text-sm">
        <span className="text-gray-500">
          <span className="font-semibold text-gray-900">{batches.length}</span>{' '}
          batch{batches.length !== 1 ? 'es' : ''}
        </span>
        <span className="text-gray-500">
          Total stock:{' '}
          <span className="font-semibold text-gray-900">{totalStock} {unitSymbol}</span>
        </span>
        <span className="text-gray-500">
          Total purchased:{' '}
          <span className="font-semibold text-gray-900">{totalPurchased} {unitSymbol}</span>
        </span>
      </div>
    </div>
  );
}

// ─── BatchesTab (public export) ───────────────────────────────────────────────

interface BatchesTabProps {
  productId: number;
  shopId: number;
  unitSymbol: string;
  onBatchCountChange?: (count: number) => void;
}

export default function BatchesTab({
  productId,
  shopId,
  unitSymbol,
  onBatchCountChange,
}: BatchesTabProps) {
  // 1. Initialize state properly as an empty array to prevent undefined maps
  const [batches,       setBatches]       = useState<Batch[]>([]);
  const [showForm,      setShowForm]      = useState(false);
  // 2. Start initial refresh as true so we can show a loader on mount
  const [isRefreshing,  setIsRefreshing]  = useState(true); 

  const handleBatchAdded = (newBatch: Batch) => {
  // 1. Cleanly update the local state with a pure function
  setBatches(prev => [newBatch, ...prev]);
  
  // 2. Safely trigger the parent callback outside of the state updater
  onBatchCountChange?.(batches.length + 1);
};

  const refreshBatches = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`/api/products/batches/${productId}`);
      if (!res.ok) throw new Error('Failed to reload batches');
      const fresh: Batch[] = await res.json();
      setBatches(fresh);
      onBatchCountChange?.(fresh.length);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // 3. Add useEffect to fetch data as soon as the component loads
  useEffect(() => {
    refreshBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-gray-900">Purchase Batches</h2>
          <p className="text-sm text-gray-500 mt-0.5">All stock batches for this product</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={refreshBatches}
            disabled={isRefreshing}
            title="Refresh batches"
            className="p-2 rounded-lg border border-gray-300 bg-white text-gray-500 hover:bg-gray-50
                       disabled:opacity-40 transition shadow-sm"
          >
            <svg
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0
                   0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white text-sm font-medium
                       rounded-lg hover:bg-orange-600 shadow-sm transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Batch
          </button>
        </div>
      </div>

      {showForm && (
        <AddBatchForm
          productId={productId}
          shopId={shopId}
          onSuccess={handleBatchAdded}
          onClose={() => setShowForm(false)}
        />
      )}

      {isRefreshing && batches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3 text-sm">
          <svg className="w-6 h-6 animate-spin text-orange-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading batches…
        </div>
      ) : (
        <BatchesTable batches={batches} unitSymbol={unitSymbol} />
      )}
    </div>
  );
}