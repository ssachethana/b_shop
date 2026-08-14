import { DollarSign, Receipt, ShoppingCart } from "lucide-react";
import { ShopAnalytics, Period } from "./types";
import { formatCurrency } from "./Format";
import { TrendingUpIcon, TrendingDownIcon } from "./Trendicons";

export interface StatCardData {
  label: string;
  value: string;
  sub: string;
  up: boolean;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bg: string;
}

export function buildStats(analytics: ShopAnalytics, period: Period): StatCardData[] {
  const map = {
    day: {
      revenue: analytics.dayTotalRevenue,
      cost: analytics.dayTotalCost,
      profit: analytics.dayTotalProfit,
      sales: analytics.daySaleCount,
      label: "Today",
    },
    week: {
      revenue: analytics.weekTotalRevenue,
      cost: analytics.weekTotalCost,
      profit: analytics.weekTotalProfit,
      sales: analytics.weekSaleCount,
      label: "This Week",
    },
    month: {
      revenue: analytics.monthTotalRevenue,
      cost: analytics.monthTotalCost,
      profit: analytics.monthTotalProfit,
      sales: analytics.monthSaleCount,
      label: "This Month",
    },
    year: {
      revenue: analytics.yearTotalRevenue,
      cost: analytics.yearTotalCost,
      profit: analytics.yearTotalProfit,
      sales: analytics.yearSaleCount,
      label: "This Year",
    },
  } as const;

  const d = map[period];

  return [
    {
      label: "Total Revenue",
      value: formatCurrency(d.revenue),
      sub: d.label,
      up: true,
      icon: DollarSign,
      color: "#F5A623",
      bg: "#FFF8EC",
    },
    {
      label: "Total Cost",
      value: formatCurrency(d.cost),
      sub: d.label,
      up: false,
      icon: Receipt,
      color: "#EF4444",
      bg: "#FFF0F0",
    },
    {
      label: "Net Profit",
      value: formatCurrency(d.profit),
      sub: d.label,
      up: d.profit >= 0,
      icon: d.profit >= 0 ? TrendingUpIcon : TrendingDownIcon,
      color: d.profit >= 0 ? "#10B981" : "#EF4444",
      bg: d.profit >= 0 ? "#ECFDF5" : "#FFF0F0",
    },
    {
      label: "Total Sales",
      value: d.sales.toLocaleString(),
      sub: `${d.label} · orders`,
      up: true,
      icon: ShoppingCart,
      color: "#3B82F6",
      bg: "#EFF6FF",
    },
  ];
}