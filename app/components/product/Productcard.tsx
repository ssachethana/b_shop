"use client";

import React, { useState } from "react";
import { MoreVertical, DollarSign, Package, Globe, Star } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
// Category is now a plain string so it works with any API-driven category name.
export interface Product {
  id: string;
  name: string;
  category: string;          // was a strict union – now open string
  price: number;
  currency?: string;
  stock: number;
  stockUnit?: string;
  lowStockThreshold?: number;
  isFavorite?: boolean;
  isUniversalProduct?: boolean;
  imageUrl?: string;
  emoji?: string;
  brand?: string;
  sku?: string;
}

export interface ProductCardProps {
  product: Product;
  variant?: "default" | "featured";
  onFavoriteToggle?: (id: string, value: boolean) => void;
  onMenuClick?: (id: string) => void;
  onClick?: (id: string) => void;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
/** Pick an emoji for any category string (case-insensitive, fallback to 📦). */
function getCategoryEmoji(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("electron"))  return "⌚";
  if (c.includes("audio"))     return "🎧";
  if (c.includes("lifestyle")) return "🧴";
  if (c.includes("watch"))     return "⌚";
  if (c.includes("fitness"))   return "🏃";
  if (c.includes("gaming"))    return "🎮";
  if (c.includes("fruit"))     return "🍎";
  if (c.includes("food"))      return "🍽️";
  if (c.includes("cloth"))     return "👕";
  if (c.includes("book"))      return "📚";
  if (c.includes("tool"))      return "🔧";
  return "📦";
}

/** Pick a background colour for any category string. */
function getCategoryColor(category: string): string {
  const c = category.toLowerCase();
  if (c.includes("electron"))  return "bg-orange-100";
  if (c.includes("audio"))     return "bg-blue-100";
  if (c.includes("lifestyle")) return "bg-green-100";
  if (c.includes("watch"))     return "bg-purple-100";
  if (c.includes("fitness"))   return "bg-red-100";
  if (c.includes("gaming"))    return "bg-indigo-100";
  if (c.includes("fruit"))     return "bg-lime-100";
  if (c.includes("food"))      return "bg-yellow-100";
  return "bg-gray-100";
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StockBar({ stock, threshold }: { stock: number; threshold: number }) {
  const isLow = stock <= threshold;
  const pct = Math.min(100, (stock / Math.max(threshold * 3, 1)) * 100);
  if (!isLow) return null;

  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-0.5">
      <div
        className="bg-red-500 h-1.5 rounded-full transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductCard({
  product,
  variant = "default",
  onFavoriteToggle,
  onMenuClick,
  onClick,
  className = "",
}: ProductCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const {
    id,
    name,
    category,
    price,
    currency = "LKR",
    stock,
    stockUnit = "Unit",
    lowStockThreshold = 15,
    isFavorite = false,
    isUniversalProduct = false,
    imageUrl,
    emoji,
    brand,
    sku,
  } = product;

  const isLowStock    = stock <= lowStockThreshold;
  const isFeatured    = variant === "featured";
  const displayEmoji  = emoji ?? getCategoryEmoji(category);
  const bgColor       = getCategoryColor(category);
  const showImage     = !!imageUrl && !imgError;

  return (
    <div
      onClick={() => onClick?.(id)}
      className={[
        "relative group rounded-2xl border transition-all duration-200 select-none",
        isFeatured
          ? "border-amber-200 bg-amber-50/40 shadow-sm"
          : isLowStock
          ? "border-red-200 bg-red-50/30"
          : "border-gray-100 bg-white hover:shadow-md hover:border-gray-200",
        onClick ? "cursor-pointer" : "",
        className,
      ].join(" ")}
    >
      {/* Top row */}
      <div className="flex items-start justify-between px-4 pt-4 pb-2">
        {/* Icon / Image + Name */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl ${bgColor} flex items-center justify-center text-xl flex-shrink-0 overflow-hidden`}
          >
            {showImage ? (
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              displayEmoji
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-900 text-sm leading-tight">{name}</p>
            <p className="text-gray-400 text-xs capitalize">{category}</p>
            {brand && <p className="text-gray-300 text-[10px]">{brand}</p>}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
              onMenuClick?.(id);
            }}
            className="text-gray-300 hover:text-gray-500 transition-colors p-1 rounded-lg hover:bg-gray-100"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 bg-white border border-gray-100 rounded-xl shadow-lg py-1 min-w-[130px]">
              {["Edit", "Duplicate", "Archive", "Delete"].map((item) => (
                <button
                  key={item}
                  onClick={(e) => e.stopPropagation()}
                  className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors ${
                    item === "Delete" ? "text-red-500" : "text-gray-700"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-4 pb-3 space-y-1.5">
        {/* SKU badge */}
        {sku && (
          <p className="text-[10px] text-gray-300 font-mono">SKU: {sku}</p>
        )}

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <DollarSign size={12} className="text-gray-400" />
          <span>
            Price :{" "}
            <span className="font-semibold text-gray-800">
              {price > 0 ? `${currency} ${price.toLocaleString()}` : "—"}
            </span>
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <Package size={12} className="text-gray-400" />
              <span>
                Stock :{" "}
                <span className={`font-semibold ${isLowStock ? "text-red-500" : "text-gray-800"}`}>
                  {stock}
                </span>{" "}
                <span className="text-gray-400">{stockUnit}</span>
              </span>
            </div>
            {isLowStock && (
              <span className="text-red-400 font-medium text-[10px]">Low stock</span>
            )}
          </div>
          <StockBar stock={stock} threshold={lowStockThreshold} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-50">
        {isUniversalProduct ? (
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Globe size={12} className="text-gray-300" />
            Universal Product
          </div>
        ) : (
          <div />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle?.(id, !isFavorite);
          }}
          className="transition-transform hover:scale-110 active:scale-95"
        >
          <Star
            size={18}
            fill={isFavorite ? "#F59E0B" : "none"}
            stroke={isFavorite ? "#F59E0B" : "#D1D5DB"}
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
}