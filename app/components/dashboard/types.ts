export interface ShopAnalytics {
  id: number;
  shopId: number;
  currentDayKey: string;
  currentWeekKey: string;
  currentMonthKey: string;
  currentYearKey: string;
  dayTotalRevenue: number;
  dayTotalCost: number;
  dayTotalProfit: number;
  daySaleCount: number;
  weekTotalRevenue: number;
  weekTotalCost: number;
  weekTotalProfit: number;
  weekSaleCount: number;
  monthTotalRevenue: number;
  monthTotalCost: number;
  monthTotalProfit: number;
  monthSaleCount: number;
  yearTotalRevenue: number;
  yearTotalCost: number;
  yearTotalProfit: number;
  yearSaleCount: number;
}

export type Period = "day" | "week" | "month" | "year";

export interface Sale {
  id: string;
  customer: string;
  product: string;
  category: string;
  date: string;
  amount: string;
  status: "Completed" | "Pending" | "Cancelled";
}

export interface TopProduct {
  name: string;
  sold: number;
  revenue: string;
  stock: number;
  pct: number;
}

export interface Expense {
  label: string;
  date: string;
  amount: string;
  type: string;
}