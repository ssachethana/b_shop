import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { StatSkeleton } from "./Statskeleton";
import { StatCardData } from "./buildStats";

interface StatCardsGridProps {
  loading: boolean;
  stats: StatCardData[];
}

export function StatCardsGrid({ loading, stats }: StatCardsGridProps) {
  return (
    // UPDATED: Added responsive grid classes here
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading
        ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)
        : stats.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      {s.label}
                    </span>
                    <span className="text-xl font-bold text-gray-900">{s.value}</span>
                  </div>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: s.bg }}
                  >
                    <Icon width={18} height={18} style={{ color: s.color }} />
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-semibold ${
                    s.up ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {s.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {s.sub}
                </div>
              </div>
            );
          })}
    </div>
  );
}