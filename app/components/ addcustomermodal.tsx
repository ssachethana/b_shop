interface AddCustomerModalProps {
  onClose: () => void;
}

export function AddCustomerModal({ onClose }: AddCustomerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Add Customer</h2>
        <p className="text-sm text-gray-400 mb-5">Register a new customer</p>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">First Name</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                placeholder="Nimal"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Last Name</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
                placeholder="Perera"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              placeholder="nimal@example.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone</label>
            <input
              type="tel"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              placeholder="+94 77 123 4567"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Address</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              placeholder="Colombo, Sri Lanka"
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
            Save Customer
          </button>
        </div>
      </div>
    </div>
  );
}