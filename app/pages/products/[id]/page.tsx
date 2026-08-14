'use client';

// app/product/[id]/page.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Product, EditForm } from '../../../types/product-types';
import BatchesTab from '../../../components/product/purchaseBatch/batchestab';
import ImageUpload from '../../../components/imageUpload'; 

export default function ProductDetailsPage() {
  const params    = useParams();
  const router    = useRouter();
  const productId = params?.id;

  const [product,  setProduct]  = useState<Product | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [batchCount, setBatchCount] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm,  setEditForm]  = useState<EditForm>({
    name: '', sku: '', barcode: '', description: '', valuationMethod: '0', imageUrl: '',
  });
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Failed to fetch product details');
        const data: Product = await res.json();
        setProduct(data);
        setBatchCount(data.batches?.length ?? 0);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [productId]);

  const handleEditClick = () => {
    if (!product) return;
    setEditForm({
      name:            product.name            ?? '',
      sku:             product.sku             ?? '',
      barcode:         product.barcode         ?? '',
      description:     product.description     ?? '',
      valuationMethod: String(product.valuationMethod ?? 0),
      imageUrl:        product.imageUrl        ?? '',
    });
    setSaveError(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
  if (!product) return;
  setSaving(true);
  setSaveError(null);

  try {
    // ── Delete old image from R2 if it was replaced ──────────────────────
    const oldImageUrl = product.imageUrl;
    const newImageUrl = editForm.imageUrl || null;
    const imageWasReplaced =
      oldImageUrl &&                  // there was an old image
      oldImageUrl !== newImageUrl;    // and it's different from the new one

    if (imageWasReplaced) {
      // Fire-and-forget: don't block saving if deletion fails
      fetch('/api/upload/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: oldImageUrl }),
      }).catch(err => console.error('Failed to delete old image:', err));
    }

    // ── Save product ──────────────────────────────────────────────────────
    const res = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id:              product.id,
        name:            editForm.name,
        sku:             editForm.sku,
        barcode:         editForm.barcode     || null,
        description:     editForm.description || null,
        valuationMethod: editForm.valuationMethod,
        imageUrl:        newImageUrl,
      }),
    });

    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || 'Failed to update product');
    }

    setProduct(prev =>
      prev ? {
        ...prev,
        name:            editForm.name,
        sku:             editForm.sku,
        barcode:         editForm.barcode     || null,
        description:     editForm.description || null,
        valuationMethod: Number(editForm.valuationMethod),
        imageUrl:        newImageUrl ?? undefined,
      } : prev
    );
    setIsEditing(false);
  } catch (e: any) {
    setSaveError(e.message);
  } finally {
    setSaving(false);
  }
};

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-3 text-gray-500">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        Loading product details…
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="p-8">
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg text-sm">
        {error || 'Product not found'}
      </div>
      <button onClick={() => router.push('/product')} className="mt-4 text-sm text-orange-600 hover:underline">
        ← Back to Products
      </button>
    </div>
  );

  const valuationMethodLabel = product.valuationMethod === 0 ? 'FIFO' : 'LIFO';
  const latestBatch          = product.batches?.[0];
  const displaySellingPrice  =
    latestBatch?.sellPrice != null && !isNaN(Number(latestBatch.sellPrice))
      ? Number(latestBatch.sellPrice).toFixed(2)
      : '0.00';

  const inputCls =
    'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 ' +
    'focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition bg-white';

  const TABS = ['Overview', 'Batches', 'Transactions', 'History'];

  return (
    <div className="max-w-6xl mx-auto bg-white min-h-screen">

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <button
              onClick={() => router.push('/product')}
              className="text-xs text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
            >
              ← Back to Products
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-center text-sm text-gray-500 mt-1 gap-3">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0
                       01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                </svg>
                SKU: {product.sku}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {product.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-lg font-bold text-gray-900">
                {product.batches?.reduce((s, b) => s + b.remaining, 0) ?? 0}
              </div>
              <div className="text-xs text-gray-500">Total Stock</div>
            </div>
            <div className="text-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-lg font-bold text-gray-900">{batchCount}</div>
              <div className="text-xs text-gray-500">Batches</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ───────────────────────────────────────────────────────────── */}
      <div className="px-8 border-b border-gray-200">
        <nav className="flex space-x-6">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-orange-500 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
              {tab === 'Batches' && batchCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                  {batchCount}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'Overview' && (
        <div className="p-8">
          <div className="bg-gray-50 rounded-xl p-8 relative flex flex-col md:flex-row gap-8 min-h-[500px]">

            {/* Edit / Save / Cancel */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 rounded-lg
                               text-sm text-gray-600 hover:bg-gray-50 shadow-sm disabled:opacity-50 transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 rounded-lg text-sm text-white
                               hover:bg-orange-600 shadow-sm disabled:opacity-60 transition"
                  >
                    {saving ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        Saving…
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        Save
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg
                             text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition"
                >
                  Edit
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                  </svg>
                </button>
              )}
            </div>

            {/* LEFT: field grid */}
            <div className="flex-1 space-y-8">
              {saveError && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2.5 rounded-lg text-sm">
                  {saveError}
                </div>
              )}

              <div className="grid grid-cols-[200px_1fr] gap-y-5 items-center text-sm">
                <div className="text-gray-500">Item Name</div>
                {isEditing
                  ? <input name="name" value={editForm.name} onChange={handleFormChange} className={inputCls} placeholder="Item name"/>
                  : <div className="font-semibold text-gray-900">{product.name}</div>}

                <div className="text-gray-500">SKU</div>
                {isEditing
                  ? <input name="sku" value={editForm.sku} onChange={handleFormChange} className={inputCls} placeholder="SKU"/>
                  : <div className="font-semibold text-gray-900">{product.sku}</div>}

                <div className="text-gray-500">Barcode</div>
                {isEditing
                  ? <input name="barcode" value={editForm.barcode} onChange={handleFormChange} className={inputCls} placeholder="Barcode (optional)"/>
                  : <div className="font-semibold text-gray-900">{product.barcode ?? '—'}</div>}

                <div className="text-gray-500">Unit</div>
                <div className="font-semibold text-gray-900">{product.unit?.symbol ?? '—'}</div>

                <div className="text-gray-500">Category</div>
                <div className="font-semibold text-gray-900">{product.category?.name ?? '—'}</div>

                <div className="text-gray-500">Brand</div>
                <div className="font-semibold text-gray-900">{product.brand?.name ?? '—'}</div>

                <div className="text-gray-500 leading-tight">
                  Inventory Valuation<br/>Method
                </div>
                {isEditing
                  ? <select name="valuationMethod" value={editForm.valuationMethod} onChange={handleFormChange} className={inputCls}>
                      <option value="0">FIFO</option>
                      <option value="1">LIFO</option>
                    </select>
                  : <div className="font-semibold text-gray-900">{valuationMethodLabel}</div>}

                <div className="text-gray-500">Description</div>
                {isEditing
                  ? <textarea name="description" value={editForm.description} onChange={handleFormChange}
                      rows={3} className={`${inputCls} resize-none`} placeholder="Description (optional)"/>
                  : <div className="font-semibold text-gray-900">{product.description ?? '—'}</div>}
              </div>

              {/* Purchase info */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Purchase Information</h3>
                <div className="grid grid-cols-[200px_1fr] gap-y-4 text-sm">
                  <div className="text-gray-500">Cost Price</div>
                  <div className="font-semibold text-gray-900">
                    {latestBatch ? `LKR ${Number(latestBatch.costPerUnit).toFixed(2)}` : '—'}
                  </div>
                  <div className="text-gray-500">Purchase Account</div>
                  <div className="font-semibold text-gray-900">Cost Of Goods Sold</div>
                </div>
              </div>

              {/* Sales info */}
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-sm">Sales Information</h3>
                <div className="grid grid-cols-[200px_1fr] gap-y-4 text-sm">
                  <div className="text-gray-500">Selling Price</div>
                  <div className="font-semibold text-gray-900">LKR {displaySellingPrice}</div>
                  <div className="text-gray-500">Sales Account</div>
                  <div className="font-semibold text-gray-900">Sales</div>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm">Reporting Tags</h3>
                <div className="text-gray-500 text-sm">No reporting tag has been associated with this item</div>
              </div>
            </div>

            {/* ── RIGHT: image panel ──────────────────────────────────────────── */}
            <div className="w-full md:w-[360px]">
              <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm flex flex-col gap-3">

                {isEditing ? (
                  /* Edit mode → full ImageUpload component */
                  <ImageUpload
                    value={editForm.imageUrl}
                    onChange={(url) => setEditForm(prev => ({ ...prev, imageUrl: url }))}
                    onError={(msg) => setSaveError(msg)}
                  />
                ) : (
                  /* View mode → static preview */
                  <>
                    <div className="bg-gray-100 w-full h-[200px] rounded-lg overflow-hidden flex items-center justify-center">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="text-gray-400 text-xs text-center p-4">No Image Available</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {[2, 3].map(n => (
                        <div key={n} className="bg-gray-100 flex-1 h-[80px] rounded-lg flex items-center justify-center">
                          <span className="text-gray-300 text-xs">Image {n}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}

              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'Batches' && (
        <BatchesTab
          productId={product.id}
          shopId={product.shopId}
          unitSymbol={product.unit?.symbol ?? 'units'}
          onBatchCountChange={setBatchCount}
        />
      )}

      {activeTab === 'Transactions' && (
        <div className="p-8 text-gray-500 text-center py-16">Transactions history will appear here.</div>
      )}
      {activeTab === 'History' && (
        <div className="p-8 text-gray-500 text-center py-16">Product activity history will appear here.</div>
      )}
    </div>
  );
}