"use client";

import React, { useState, useMemo } from "react";
import { Search, AlertTriangle, Tag, Package } from "lucide-react";
import type { Product } from "../../types/sales";
import { useCart } from "./CartContext";

interface ProductGridProps {
  products: Product[];
  currency: string;
  isLoading: boolean;
}

export default function ProductGrid({ products, currency, isLoading }: ProductGridProps) {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const { addItem } = useCart();

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category.name)));
    return ["All", ...cats];
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => {
      const matchCat = activeCategory === "All" || p.category.name === activeCategory;
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode?.toLowerCase().includes(q) ?? false);
      return matchCat && matchQ;
    });
  }, [products, query, activeCategory]);

  const gridClass =
    "grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-[0.55rem] overflow-y-auto pr-0.5 content-start flex-1 min-h-0";

  return (
    <div className="flex flex-col gap-[0.65rem] h-full min-h-0">
      {/* Search bar */}
      <div className="relative flex items-center bg-slate-50 shadow-sm border border-gray-100 rounded-[10px] px-3  focus-within:bg-white transition-colors">
        <Search size={16} className="text-gray-400 shrink-0" />
        <input
          className="flex-1 border-none bg-transparent py-[0.55rem] px-2 text-[0.85rem] text-slate-900 outline-none placeholder:text-gray-400"
          placeholder="Search by name, SKU or barcode…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            className="bg-transparent text-gray-400 text-[1.1rem] cursor-pointer px-px leading-none hover:text-gray-600"
            onClick={() => setQuery("")}
          >
            ×   
          </button>
        )}
      </div>

      {/* Category pills */}
      <div className="flex gap-[0.4rem] overflow-x-auto pb-px shrink-0 [&::-webkit-scrollbar]:hidden">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`border-none rounded-full px-[0.8rem] py-[0.3rem] text-[0.75rem] font-semibold cursor-pointer whitespace-nowrap transition-all duration-120
              ${cat === activeCategory
                ? "bg-[#F5A623] text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className={gridClass}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-37 rounded-xl bg-linear-to-r from-slate-100 via-slate-200 to-slate-100 bg-size-[200%_100%] animate-shimmer"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
          <Package size={32} />
          <p className="text-[0.85rem] font-semibold">No products found</p>
        </div>
      ) : (
        <div className={gridClass}>
          {filtered.map((p) => {
            const outOfStock = p.currentStock <= 0;
            const lowStock = !outOfStock && p.currentStock <= p.lowStockThreshold && p.lowStockThreshold > 0;
            const hasPromo = !!p.activePromotion;

            return (
              <button
                key={p.id}
                onClick={() => !outOfStock && addItem(p)}
                disabled={outOfStock}
                className={`border-[1.5px] border-slate-100 rounded-xl bg-white cursor-pointer text-left p-0 overflow-hidden relative transition-all duration-150 flex flex-col
                  ${outOfStock
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:border-indigo-500 hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(99,102,241,0.12)] active:scale-[0.97]"
                  }`}
              >
                {/* Promo badge */}
                {hasPromo && !outOfStock && (
                  <div className="absolute top-1.5 left-0 bg-amber-400 text-white text-[0.6rem] font-bold py-px pl-2 pr-1.5 rounded-r-md flex items-center gap-0.75 z-10">
                    <Tag size={10} />
                    {p.activePromotion!.discountType === "PERCENT"
                      ? `${p.activePromotion!.value}% OFF`
                      : `-${currency}${p.activePromotion!.value}`}
                  </div>
                )}

                {/* Image */}
                <div className="relative w-full pt-[65%] bg-slate-50 overflow-hidden">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[1.8rem] font-extrabold bg-linear-to-br from-indigo-100 to-violet-100 text-indigo-500">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-2 flex flex-col gap-0.5 flex-1">
                  <span className="text-[0.78rem] font-bold text-slate-900 leading-snug line-clamp-2">
                    {p.name}
                  </span>
                  <span className="text-[0.65rem] text-gray-400">{p.category.name}</span>

                  <div className="flex justify-between items-center mt-auto pt-1">
                    <span className="text-[0.8rem] font-bold text-slate-900">
                      {p.sellPrice !== null ? `${currency} ${p.sellPrice.toFixed(2)}` : "—"}
                    </span>
                    <span
                      className={`text-[0.62rem] font-bold rounded px-1.25 py-px inline-flex items-center gap-0.5
                        ${outOfStock
                          ? "bg-red-50 text-red-800"
                          : lowStock
                          ? "bg-orange-50 text-orange-700"
                          : "bg-green-50 text-green-700"
                        }`}
                    >
                      {outOfStock ? "Out" : lowStock ? (
                        <><AlertTriangle size={9} />{p.currentStock}</>
                      ) : (
                        p.currentStock
                      )}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}