import { Layers, ShoppingCart, Box, Receipt, UserPlus, ArrowUpRight } from "lucide-react";

interface QuickActionsProps {
  onAddExpense: () => void;
  onAddCustomer: () => void;
}

export function QuickActions({ onAddExpense, onAddCustomer }: QuickActionsProps) {
  const actions = [
    { label: "New Sale", icon: ShoppingCart, color: "#F5A623", bg: "#FFF8EC", action: undefined as (() => void) | undefined },
    { label: "Add Stock", icon: Box, color: "#3B82F6", bg: "#EFF6FF", action: undefined as (() => void) | undefined },
    { label: "Add Expense", icon: Receipt, color: "#EF4444", bg: "#FFF0F0", action: onAddExpense },
    { label: "Add Customer", icon: UserPlus, color: "#10B981", bg: "#ECFDF5", action: onAddCustomer },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={15} className="text-[#F5A623]" />
        <h3 className="text-sm font-bold text-gray-800">Quick Actions</h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <button
              key={a.label}
              onClick={a.action}
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition group min-w-0"
              style={{ background: a.bg }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm shrink-0">
                <Icon size={16} style={{ color: a.color }} />
              </div>
              <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 truncate">
                {a.label}
              </span>
              <ArrowUpRight size={13} className="ml-auto shrink-0 text-gray-300 group-hover:text-gray-500 transition hidden sm:block" />
            </button>
          );
        })}
      </div>
    </div>
  );
}