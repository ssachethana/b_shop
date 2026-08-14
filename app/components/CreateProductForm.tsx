'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import ImageUpload from './imageUpload'; // adjust path to match your project structure
import InfoTooltip from './InfoTooltip';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  sku: string;
  categoryId: number;
  brandId: number | null;
  unitId: number;
  category: { name: string } | null;
  unit: { name: string; symbol: string } | null;
  brand: { name: string } | null;
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export default function CreateProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [success, setSuccess]     = useState(false);
  const [units, setUnits]         = useState<any[]>([]);
  const [category, setCategory]   = useState<any[]>([]);
  const [brand, setBrand]         = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    categoryId: '',
    brandId: '',
    unitId: '',
    lowStockThreshold: 0,
    valuationMethod: 0,
    isActive: true,
    imageUrl: '',
  });

  // ── Search / Dropdown state ──────────────────
  const [categorySearch, setCategorySearch]         = useState('');
  const [brandSearch, setBrandSearch]               = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown]   = useState(false);

  // ── Modal state ──────────────────────────────
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName]         = useState('');
  const [isBrandModalOpen, setIsBrandModalOpen]       = useState(false);
  const [newBrandName, setNewBrandName]               = useState('');
  const [isModalLoading, setIsModalLoading]           = useState(false);

  // ── Data fetching ────────────────────────────
  const fetchUnits = async () => { 
    try { 
      const res = await fetch('/api/unit');
      const data = await res.json();
      // If your API returns { data: [...] }, change this to setUnits(data.data || [])
      setUnits(Array.isArray(data) ? data : (data.units || data.data || [])); 
    } catch {} 
  };

  const fetchCategory = async () => { 
    try { 
      const res = await fetch('/api/category');
      const data = await res.json();
      setCategory(Array.isArray(data) ? data : (data.categories || data.data || [])); 
    } catch {} 
  };

  const fetchBrand = async () => { 
    try { 
      const res = await fetch('/api/brand');
      const data = await res.json();
      setBrand(Array.isArray(data) ? data : (data.brands || data.data || [])); 
    } catch {} 
  };

  useEffect(() => {
    fetchUnits();
    fetchCategory();
    fetchBrand();
  }, []);

  // Add a fallback `|| []` to ensure it's always an array
  const filteredCategories = (Array.isArray(category) ? category : []).filter((c) =>
    c?.name?.toLowerCase().includes(categorySearch.toLowerCase())
  );
  
  const filteredBrands = (Array.isArray(brand) ? brand : []).filter((b) =>
    b?.name?.toLowerCase().includes(brandSearch.toLowerCase())
  );

  // ── Handlers ─────────────────────────────────
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categoryId:       formData.categoryId  ? parseInt(formData.categoryId)  : undefined,
          brandId:          formData.brandId     ? parseInt(formData.brandId)     : undefined,
          unitId:           formData.unitId      ? parseInt(formData.unitId)      : undefined,
          lowStockThreshold: parseInt(String(formData.lowStockThreshold)),
          valuationMethod:   parseInt(String(formData.valuationMethod)),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create product');

      setSuccess(true);
      setFormData({
        name: '', sku: '', barcode: '', description: '',
        categoryId: '', brandId: '', unitId: '',
        lowStockThreshold: 0, valuationMethod: 0, isActive: true, imageUrl: '',
      });
      setCategorySearch('');
      setBrandSearch('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    setIsModalLoading(true);
    try {
      const res = await fetch('/api/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName }),
      });
      if (!res.ok) throw new Error('Failed to create category');
      await fetchCategory();
      setIsCategoryModalOpen(false);
      setNewCategoryName('');
    } catch (err: any) { alert(err.message); }
    finally { setIsModalLoading(false); }
  };

  const handleCreateBrand = async (e: FormEvent) => {
    e.preventDefault();
    setIsModalLoading(true);
    try {
      const res = await fetch('/api/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newBrandName }),
      });
      if (!res.ok) throw new Error('Failed to create brand');
      await fetchBrand();
      setIsBrandModalOpen(false);
      setNewBrandName('');
    } catch (err: any) { alert(err.message); }
    finally { setIsModalLoading(false); }
  };

  // ── Render ────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md relative">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Product</h2>

      {error   && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">Product created successfully!</div>}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* ── Basic info ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 flex items-center">
             Product Name *
            <InfoTooltip text="A short, descriptive name customers will see for this product." />
            </label>
            <input type="text" name="name" required value={formData.name} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              SKU *
              <InfoTooltip text="A unique code you use internally to track this product in inventory." />
            </label>
            <input type="text" name="sku" required value={formData.sku} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-blue-500" />
          </div>
        </div>

        {/* ── Relations ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Category */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Category *
              <InfoTooltip text="Groups this product with similar items for filtering and reporting." />
            </label>
            <div className="flex mt-1 gap-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Category..."
                  
                  
                  className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                />
                
              </div>
              
            </div>
          </div>
          {/* Local Category */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Local Category *
              <InfoTooltip text="Groups this product with similar items for filtering and reporting." />
            </label>
            <div className="flex mt-1 gap-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Category..."
                  value={categorySearch}
                  onFocus={() => setShowCategoryDropdown(true)}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                />
                {showCategoryDropdown && (
                  <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                    {filteredCategories.length > 0
                      ? filteredCategories.map((c) => (
                        <li
                          key={c.id}
                          onClick={() => {
                            setFormData({ ...formData, categoryId: c.id.toString() });
                            setCategorySearch(c.name);
                            setShowCategoryDropdown(false);
                          }}
                          className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                        >
                          {c.name}
                        </li>
                      ))
                      : <li className="p-2 text-gray-500 text-sm">No results</li>
                    }
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition font-bold"
              >+</button>
            </div>
          </div>

          {/* Brand */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              Brand
              <InfoTooltip text="The manufacturer or brand name for this product, if applicable." />
            </label>
            <div className="flex mt-1 gap-1">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search Brand..."
                  value={brandSearch}
                  onFocus={() => setShowBrandDropdown(true)}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm"
                />
                {showBrandDropdown && (
                  <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-auto">
                    {filteredBrands.length > 0
                      ? filteredBrands.map((b) => (
                        <li
                          key={b.id}
                          onClick={() => {
                            setFormData({ ...formData, brandId: b.id.toString() });
                            setBrandSearch(b.name);
                            setShowBrandDropdown(false);
                          }}
                          className="p-2 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0"
                        >
                          {b.name}
                        </li>
                      ))
                      : <li className="p-2 text-gray-500 text-sm">No results</li>
                    }
                  </ul>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(true)}
                className="px-3 py-2 bg-gray-100 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-200 transition font-bold"
              >+</button>
            </div>
          </div>

          {/* Unit */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Unit *
              <InfoTooltip text="How this product is measured or sold, e.g. piece, kg, box." />
            </label>
            <select name="unitId" required value={formData.unitId} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-sm">
              <option value="">Select Unit</option>
              {units.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.symbol})</option>)}
            </select>
          </div>
        </div>

        {/* ── Description ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" rows={2} value={formData.description} onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
        </div>

        {/* ── Low Stock + Valuation ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Low Stock Threshold
              <InfoTooltip text="You'll get a low-stock alert once quantity on hand drops to this number." />
            </label>
            <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold}
              onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Valuation Method
              <InfoTooltip text="How the cost of this product's inventory is calculated for accounting (FIFO or LIFO)." />
            </label>
            <select name="valuationMethod" value={formData.valuationMethod} onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border">
              <option value={0}>FIFO</option>
              <option value={1}>LIFO</option>
            </select>
          </div>
        </div>

        {/* ── Image Upload (separate component) ── */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <label className="block text-sm font-medium text-gray-700">Product Image</label>

          <ImageUpload
            value={formData.imageUrl}
            onChange={(url) => setFormData((prev) => ({ ...prev, imageUrl: url }))}
            onError={(msg) => setError(msg)}
          />

          {/* Manual URL fallback */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 whitespace-nowrap">Or paste URL</span>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://…"
              value={formData.imageUrl}
              onChange={handleChange}
              className="flex-1 border border-gray-300 rounded-md p-1.5 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#f4b651] hover:bg-[#F5A623] disabled:opacity-50"
        >
          {isLoading ? 'Creating...' : 'Create Product'}
        </button>
      </form>

      {/* ── Category Modal ── */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="font-bold mb-4">New Category</h3>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
              placeholder="Category name"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsCategoryModalOpen(false)} className="text-gray-500">Cancel</button>
              <button onClick={handleCreateCategory} disabled={isModalLoading}
                className="bg-[#F5A623] text-white px-4 py-1 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Brand Modal ── */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="font-bold mb-4">New Brand</h3>
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              className="w-full border p-2 mb-4 rounded"
              placeholder="Brand name"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsBrandModalOpen(false)} className="text-gray-500">Cancel</button>
              <button onClick={handleCreateBrand} disabled={isModalLoading}
                className="bg-[#F5A623] text-white px-4 py-1 rounded">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}