export function StatSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-2">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          <div className="h-6 w-36 bg-gray-200 rounded" />
        </div>
        <div className="w-10 h-10 rounded-xl bg-gray-100" />
      </div>
      <div className="h-3 w-28 bg-gray-100 rounded" />
    </div>
  );
}