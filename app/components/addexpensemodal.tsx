interface AddExpenseModalProps {
  onClose: () => void;
}

export function AddExpenseModal({ onClose }: AddExpenseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Add Expense</h2>
        <p className="text-sm text-gray-400 mb-5">Record a new expense entry</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Expense Label</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              placeholder="e.g. Stock Restock – Electronics"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Amount (LKR)</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Type</label>
              <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition bg-white">
                <option>Inventory</option>
                <option>Operations</option>
                <option>Payroll</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Date</label>
            <input
              type="date"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-900 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-700 transition"
          >
            Save Expense
          </button>
        </div>
      </div>
    </div>
  );
}