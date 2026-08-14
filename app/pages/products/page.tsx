"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import ProductCard, { Product } from "../../components/product/Productcard";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import {
  LayoutGrid,
  List,
  Plus,
  Settings,
  Search,
  SlidersHorizontal,
  Group,
  ArrowUpDown,
  Package,
  RefreshCw,
  AlertCircle,
  PackageX,
} from "lucide-react";



// ─── API Types ────────────────────────────────────────────────────────────────
// Raw shape returned by GET /api/products
interface ApiBatch {
  quantity?: number;
  sellingPrice?: number;
  costPrice?: number;
  remaining?: string | number;
  sellPrice?: string | number;
}

interface ApiProduct {
  id: number;
  name: string;
  sku: string | null;
  barcode: string | null;
  description: string | null;
  imageUrl: string | null;
  lowStockThreshold: number;
  brandId: number;
  categoryId: number;
  unitId: number;
  valuationMethod: number;
  isActive: boolean;
  displayProductInApp: boolean;
  shopId: number;
  createdAt: string;
  updatedAt: string;
  category: { name: string };
  unit: { name: string; symbol: string };
  batches: ApiBatch[];
  brand: { name: string };
}

// ─── Mapper ───────────────────────────────────────────────────────────────────
function mapApiProduct(api: ApiProduct): Product {
  // Derive total stock from batches (remaining is a string in the API)
  const totalStock = api.batches.reduce(
    (sum, b) => sum + (Number(b.remaining) || 0),
    0
  );

  // Take the first batch's sell price; fall back to 0 when no batches yet
  const price =
    api.batches.length > 0 ? Number(api.batches[0].sellPrice) || 0 : 0;

  return {
    id: String(api.id),
    name: api.name,
    category: api.category?.name ?? "Other",
    price,
    currency: "LKR",
    stock: totalStock,
    stockUnit: api.unit?.symbol ?? "Unit",
    lowStockThreshold: api.lowStockThreshold,
    isFavorite: false,
    isUniversalProduct: api.displayProductInApp,
    imageUrl: api.imageUrl ?? undefined,
    brand: api.brand?.name,
    sku: api.sku ?? undefined,
  };
}

// ─── View Toggle ──────────────────────────────────────────────────────────────
type ViewMode = "grid" | "table";

function ViewIcon({ mode }: { mode: ViewMode }) {
  return mode === "grid" ? <LayoutGrid size={15} /> : <List size={15} />;
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-2.5 bg-gray-100 rounded w-2/3" />
      <div className="h-2.5 bg-gray-100 rounded w-1/2" />
      <div className="h-px bg-gray-100" />
      <div className="h-2.5 bg-gray-100 rounded w-1/3" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProductManagementPage() {

  const router = useRouter();
  // ── State ──
  const [products, setProducts]     = useState<Product[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [viewMode, setViewMode]     = useState<ViewMode>("grid");
  const [sortBy, setSortBy]         = useState<"name" | "price" | "stock">("name");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);


  // Favorites are managed client-side (not in the API)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // ── Fetch ──
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`Server responded ${res.status}`);
      const data: ApiProduct[] = await res.json();
      setProducts(data.map(mapApiProduct));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Favourite toggle ──
  const handleFavoriteToggle = useCallback((id: string, value: boolean) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      value ? next.add(id) : next.delete(id);
      return next;
    });
  }, []);

  // ── Filter + sort ──
  const enriched = useMemo(
    () => products.map((p) => ({ ...p, isFavorite: favorites.has(p.id) })),
    [products, favorites]
  );

  // Count of low-stock items (used for the toggle badge)
  const lowStockCount = useMemo(
    () => enriched.filter((p) => p.stock <= (p.lowStockThreshold ?? 0)).length,
    [enriched]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return enriched
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.brand ?? "").toLowerCase().includes(q) ||
          (p.sku ?? "").toLowerCase().includes(q)
      )
      .filter((p) => !showLowStockOnly || p.stock <= (p.lowStockThreshold ?? 0))
      .sort((a, b) => {
        if (sortBy === "price") return b.price - a.price;
        if (sortBy === "stock") return b.stock - a.stock;
        return a.name.localeCompare(b.name);
      });
  }, [enriched, search, sortBy, showLowStockOnly]);

  const starredProducts = filtered.filter((p) => p.isFavorite);
  const regularProducts = filtered.filter((p) => !p.isFavorite);

  // ── Render ──
  return (
    <div className="min-h-screen bg-gray-50/60 font-[Geist,system-ui,sans-serif]">
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
  <div>
    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
      <span className="text-amber-400">Product</span>{" "}
      <span className="text-gray-900">Management</span>
    </h1>
    {!loading && !error && (
      <p className="text-xs text-gray-400 mt-0.5">
        {products.length} product{products.length !== 1 ? "s" : ""} loaded
      </p>
    )}
  </div>

  <div className="flex items-center gap-2">
    <button
      onClick={fetchProducts}
      disabled={loading}
      className="w-10 h-10 shrink-0 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
      title="Refresh"
    >
      <RefreshCw size={16} strokeWidth={1.8} className={loading ? "animate-spin" : ""} />
    </button>

    <Link
      href="/pages/addnewproduct"
      className="w-10 h-10 sm:w-auto sm:h-auto shrink-0 flex items-center justify-center gap-2 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors shadow-sm whitespace-nowrap sm:px-4 sm:py-2.5"
    >
      <Plus size={18} strokeWidth={1.8} />
      <span className="hidden sm:inline">Add Product</span>
    </Link>

    <button className="w-10 h-10 shrink-0 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
      <Settings size={18} strokeWidth={1.8} />
    </button>
  </div>
</div>

        {/* ── Search ── */}
        <div className="relative mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            size={18}
            strokeWidth={2}
          />
          <input
            type="text"
            placeholder="Search by name, category, brand, or SKU…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl border border-gray-100 bg-white text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent shadow-sm"
          />
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-600 rounded-2xl px-4 py-3 mb-6 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
            <button
              onClick={fetchProducts}
              className="ml-auto text-xs font-medium underline underline-offset-2 hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Main Panel ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* ── Toolbar ── */}
<div className="flex items-center justify-end mb-6">
  <div className="flex items-center gap-1 overflow-x-auto max-w-full scrollbar-hide">
    {/* Grid / List toggle */}
    {(["grid", "table"] as ViewMode[]).map((m) => (
      <button
        key={m}
        onClick={() => setViewMode(m)}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap ${
          viewMode === m
            ? "bg-gray-100 text-gray-700"
            : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        }`}
      >
        <ViewIcon mode={m} />
        <span className="hidden sm:inline">{m === "grid" ? "Grid" : "List"}</span>
      </button>
    ))}

    <div className="w-px h-4 bg-gray-200 mx-1 shrink-0" />

    <button className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0 whitespace-nowrap">
      <SlidersHorizontal size={14} strokeWidth={1.5} />
      <span className="hidden sm:inline">Filter</span>
    </button>

    <button className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors shrink-0 whitespace-nowrap">
      <Group size={14} strokeWidth={1.5} />
      <span className="hidden sm:inline">Group</span>
    </button>

    {/* Low stock toggle */}
    <button
      onClick={() => setShowLowStockOnly((v) => !v)}
      className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 whitespace-nowrap ${
        showLowStockOnly
          ? "bg-red-50 text-red-500"
          : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
      }`}
      title="Show low stock products only"
    >
      <PackageX size={14} strokeWidth={1.5} />
      <span className="hidden sm:inline">Low Stock</span>
      {lowStockCount > 0 && (
        <span
          className={`ml-0.5 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full text-[10px] font-semibold ${
            showLowStockOnly
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {lowStockCount}
        </span>
      )}
    </button>
  </div>

  {/* Sort now lives OUTSIDE the overflow-x-auto row, so its dropdown can't get clipped */}
  <div className="relative shrink-0 ml-1">
    <button
      onClick={() => setShowSortMenu((v) => !v)}
      className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
    >
      <ArrowUpDown size={14} strokeWidth={1.5} />
      <span className="hidden sm:inline">Sort</span>
    </button>

    {showSortMenu && (
      <div className="absolute right-0 top-9 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[120px]">
        {(["name", "price", "stock",] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setSortBy(s); setShowSortMenu(false); }}
            className={`w-full text-left px-3 py-1.5 text-sm capitalize transition-colors ${
              sortBy === s
                ? "text-amber-500 font-medium bg-amber-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
    )}
  </div>
</div>

          {/* ── Loading skeletons ── */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* ── Starred products section ── */}
          {!loading && !error && starredProducts.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                ⭐ Starred
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {starredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    variant="featured"
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
              {regularProducts.length > 0 && (
                <div className="border-t border-gray-50 mt-6 pt-6">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                    All Products
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── All products ── */}
          {!loading && !error && regularProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {regularProducts.map((product) => (
                <div key={product.id} onClick={() => router.push(`/pages/products/${product.id}`)}>
                <ProductCard
                product={product}
                onFavoriteToggle={handleFavoriteToggle}
                 />
                </div>
              ))}
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && !error && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300">
              <Package size={48} strokeWidth={1} />
              <p className="mt-3 text-sm">
                {showLowStockOnly
                  ? "No low stock products right now 🎉"
                  : search
                  ? "No products match your search"
                  : "No products found"}
              </p>
              {showLowStockOnly && !search && (
                <button
                  onClick={() => setShowLowStockOnly(false)}
                  className="mt-2 text-xs text-amber-400 hover:underline"
                >
                  Show all products
                </button>
              )}
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="mt-2 text-xs text-amber-400 hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}