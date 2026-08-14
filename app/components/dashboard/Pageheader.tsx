import { LayoutDashboard, Receipt, UserPlus, PlusCircle } from "lucide-react";

interface PageHeaderProps {
  onAddExpense: () => void;
  onAddCustomer: () => void;
}

export function PageHeader({ onAddExpense, onAddCustomer }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <LayoutDashboard size={20} className="text-[#F5A623]" />
        <h2 className="text-base font-bold text-gray-800">Dashboard</h2>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={onAddExpense}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition flex-1 sm:flex-none min-w-[calc(50%-0.3125rem)] sm:min-w-0"
        >
          <Receipt size={15} className="text-red-400 shrink-0" />
          <span className="whitespace-nowrap">Add Expense</span>
        </button>

        <button
          onClick={onAddCustomer}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition flex-1 sm:flex-none min-w-[calc(50%-0.3125rem)] sm:min-w-0"
        >
          <UserPlus size={15} className="text-emerald-500 shrink-0" />
          <span className="whitespace-nowrap">Add Customer</span>
        </button>

        
      </div>
    </div>
  );
}