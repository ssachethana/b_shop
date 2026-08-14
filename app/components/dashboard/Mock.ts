import { Sale, TopProduct, Expense } from "./types";

export const recentSales: Sale[] = [
  {
    id: "#ORD-0081",
    customer: "Nimal Perera",
    product: "Galaxy Smartwatch",
    category: "Electronics",
    date: "01 Jun 2026",
    amount: "LKR 872.40",
    status: "Completed",
  },
  {
    id: "#ORD-0082",
    customer: "Sunethra Silva",
    product: "Wireless Earbuds",
    category: "Audio",
    date: "01 Jun 2026",
    amount: "LKR 1,000.40",
    status: "Pending",
  },
  {
    id: "#ORD-0083",
    customer: "Kasun Fernando",
    product: "Eco Bottle",
    category: "Lifestyle",
    date: "31 May 2026",
    amount: "LKR 500.00",
    status: "Completed",
  },
  {
    id: "#ORD-0084",
    customer: "Dilini Jayawardena",
    product: "Fitness Tracker",
    category: "Fitness",
    date: "31 May 2026",
    amount: "LKR 200.00",
    status: "Completed",
  },
  {
    id: "#ORD-0085",
    customer: "Roshan Bandara",
    product: "Wireless Earbuds",
    category: "Audio",
    date: "30 May 2026",
    amount: "LKR 1,000.40",
    status: "Cancelled",
  },
  {
    id: "#ORD-0086",
    customer: "Amali Wickramasinghe",
    product: "Galaxy Smartwatch",
    category: "Electronics",
    date: "30 May 2026",
    amount: "LKR 872.40",
    status: "Completed",
  },
  {
    id: "#ORD-0087",
    customer: "Tharaka Gunasekara",
    product: "Eco Bottle",
    category: "Lifestyle",
    date: "29 May 2026",
    amount: "LKR 500.00",
    status: "Pending",
  },
];

export const topProducts: TopProduct[] = [
  { name: "Galaxy Smartwatch", sold: 84, revenue: "LKR 73,281", stock: 30, pct: 84 },
  { name: "Wireless Earbuds", sold: 67, revenue: "LKR 67,026", stock: 10, pct: 67 },
  { name: "Eco Bottle", sold: 120, revenue: "LKR 60,000", stock: 40, pct: 100 },
  { name: "Fitness Tracker", sold: 45, revenue: "LKR 9,000", stock: 40, pct: 45 },
];

export const recentExpenses: Expense[] = [
  { label: "Stock Restock – Electronics", date: "01 Jun 2026", amount: "LKR 42,000", type: "Inventory" },
  { label: "Utility Bills", date: "31 May 2026", amount: "LKR 8,500", type: "Operations" },
  { label: "Staff Wages", date: "30 May 2026", amount: "LKR 75,000", type: "Payroll" },
  { label: "Packaging Supplies", date: "29 May 2026", amount: "LKR 12,300", type: "Inventory" },
];

export const statusColors: Record<string, string> = {
  Completed: "bg-emerald-50 text-emerald-600",
  Pending: "bg-amber-50 text-amber-600",
  Cancelled: "bg-red-50 text-red-500",
};

// Replace with your actual shop ID or pull from context/auth
export const SHOP_ID = 1;