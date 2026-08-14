import { BarChart2, ChevronRight } from "lucide-react";
import { TopProduct } from "./types";

interface TopProductsCardProps {
  products: TopProduct[];
}

export function TopProductsCard({ products }: TopProductsCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex-1">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <BarChart2 size={15} className="text-[#F5A623]" />
          <h3 className="text-sm font-bold text-gray-800">Top Products</h3>
        </div>
        <button className="text-xs font-semibold text-[#F5A623] flex items-center gap-1 hover:underline">
          View All <ChevronRight size={12} />
        </button>
      </div>
      <div className="px-5 py-4 space-y-4">
        {products.map((p) => (
          <div key={p.name}>
            <div className="flex items-center justify-between mb-1.5">
              <div>
                <div className="text-sm font-semibold text-gray-700 leading-none">{p.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {p.sold} sold · {p.revenue}
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500">{p.pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#F5A623] to-[#FFD373] transition-all"
                style={{ width: `${p.pct}%`, opacity: p.stock <= 10 ? 0.6 : 1 }}
              />
            </div>
            {p.stock <= 10 && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                <span className="text-xs text-red-400 font-medium">Low stock — {p.stock} left</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}