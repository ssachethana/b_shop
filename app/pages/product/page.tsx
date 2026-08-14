'use client';

import React, { useState, useEffect } from 'react';

// 1. Import useRouter
import { useRouter } from 'next/navigation';

// Define the TypeScript interfaces based on your Prisma schema and GET response
interface Product {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  category: { name: string } | null;
  unit: { name: string; symbol: string } | null;
  brand: { name: string } | null;
  batches: { remaining: number; sellPrice: number }[];
  isActive: boolean;
}

export default function ProductsPage() {
  // 2. Initialize the router
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for creating a new product
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    categoryId: '',
    unitId: '',
    brandId: '',
    lowStockThreshold: '10',
    imageUrl:'',
  });

  // Fetch products from the GET API
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: Ensure this path matches the actual route of your API file
      const response = await fetch('/api/products'); 
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on initial component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle POST request to create a product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Convert string inputs to numbers where necessary
          lowStockThreshold: parseInt(formData.lowStockThreshold),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create product');
      }

      // Reset form on success
      setFormData({
        name: '', sku: '', barcode: '', description: '',
        categoryId: '', unitId: '', brandId: '', lowStockThreshold: '10',imageUrl:'',
      });
      
      // Refresh the product list to show the new item
      fetchProducts();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Filter products locally based on the search query
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (product.brand?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.barcode || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
    
      <h1 className="text-3xl font-bold">Product Management</h1>

      {/* Error Message Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* SEARCH AND GET ALL ACTIONS */}
      <section className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search by name, brand, barcode or SKU..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/2 md:w-1/3"
        />
        
        <button 
          onClick={fetchProducts}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full sm:w-auto flex justify-center items-center"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Refresh / Get All'}
        </button>
      </section>

      {/* PRODUCTS TABLE */}
      <section className="overflow-x-auto bg-white rounded-lg shadow-md border">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3">Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Brand</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr 
                  key={product.id} 
                  // 3. Add onClick handler and cursor-pointer class
                  onClick={() => router.push(`/pages/product/${product.id}`)}
                  className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="p-3 font-medium">{product.name}</td>
                  <td className="p-3">{product.sku}</td>
                  <td className="p-3">{product.category?.name || 'N/A'}</td>
                  <td className="p-3">{product.brand?.name || 'N/A'}</td>
                  <td className="p-3">{product.unit?.name ? `${product.unit.name} (${product.unit.symbol})` : 'N/A'}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

    </div>
  );
}