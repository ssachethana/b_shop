import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="px-8 pt-5 pb-1">
      <div className="bg-white rounded-xl flex items-center gap-3 px-4 py-3 shadow-sm border border-gray-100">
        <Search size={16} className="text-gray-400" />
        <input
          className="flex-1 text-sm text-gray-600 placeholder-gray-400 outline-none bg-transparent"
          placeholder="Search Product..."
        />
      </div>
    </div>
  );
}