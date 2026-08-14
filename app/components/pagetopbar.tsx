import { Bell, Settings } from "lucide-react";

export function Topbar() {
  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between sticky top-0 z-40">
      <h1 className="text-2xl font-bold tracking-tight">
        <span className="text-[#F5A623]">Product</span>
        <span className="text-gray-900"> Management</span>
      </h1>
      <div className="flex items-center gap-3">
        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-500">
          <Bell size={17} />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition text-gray-500">
          <Settings size={17} />
        </button>
        <div className="w-9 h-9 rounded-xl bg-[#F5A623] flex items-center justify-center text-white text-sm font-bold">
          A
        </div>
      </div>
    </header>
  );
}