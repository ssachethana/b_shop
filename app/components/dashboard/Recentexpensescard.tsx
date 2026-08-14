import { Receipt } from "lucide-react";
import { Expense } from "./types";

interface RecentExpensesCardProps {
  expenses: Expense[];
  onAddExpense: () => void;
}

export function RecentExpensesCard({ expenses, onAddExpense }: RecentExpensesCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <Receipt size={15} className="text-red-400" />
          <h3 className="text-sm font-bold text-gray-800">Recent Expenses</h3>
        </div>
        <button
          onClick={onAddExpense}
          className="text-xs font-semibold text-[#F5A623] flex items-center gap-1 hover:underline"
        >
          + Add
        </button>
      </div>
      <div className="px-5 py-3 space-y-3">
        {expenses.map((e) => (
          <div key={e.label} className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center shrink-0 mt-0.5">
                <Receipt size={14} className="text-red-400" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-700 leading-snug">{e.label}</div>
                <div className="text-xs text-gray-400">
                  {e.date} · <span className="text-gray-500">{e.type}</span>
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-gray-800 whitespace-nowrap">{e.amount}</div>
          </div>
        ))}
      </div>
    </div>
  );
}