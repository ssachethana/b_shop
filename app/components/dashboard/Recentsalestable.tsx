import { ShoppingCart, Calendar, ChevronRight } from "lucide-react";
import { Sale } from "./types";
import { statusColors } from "./Mock";

interface RecentSalesTableProps {
  sales: Sale[];
}

export function RecentSalesTable({ sales }: RecentSalesTableProps) {
  return (
    <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-[#F5A623]" />
          <h3 className="text-sm font-bold text-gray-800">Recent Sales</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Calendar size={12} /> Jun 2026
          </span>
          <button className="text-xs font-semibold text-[#F5A623] flex items-center gap-1 hover:underline">
            View All <ChevronRight size={12} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {sales.map((row) => (
              <tr key={row.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition">
                <td className="px-6 py-3.5 text-xs font-mono text-gray-500">{row.id}</td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold text-amber-600 shrink-0">
                      {row.customer
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="font-medium text-gray-700 whitespace-nowrap">{row.customer}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div>
                    <div className="font-medium text-gray-700">{row.product}</div>
                    <div className="text-xs text-gray-400">{row.category}</div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-gray-400">{row.date}</td>
                <td className="px-4 py-3.5 text-right font-semibold text-gray-800 text-xs">{row.amount}</td>
                <td className="px-6 py-3.5 text-center">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      statusColors[row.status]
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}