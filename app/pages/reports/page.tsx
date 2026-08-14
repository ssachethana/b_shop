"use client";

/**
 * Reports.tsx
 * -----------------------------------------------------------------------
 * Reports & Analytics page for the "Bits shop" inventory management system.
 * Built to match the existing Dashboard's visual language exactly:
 *   - warm amber/orange accent (#F39D2E) on a soft zinc-100 canvas
 *   - white, rounded-2xl cards with hairline borders + soft shadow
 *   - tinted icon badges (amber / emerald / rose / blue / violet)
 *   - pill-shaped status tags and segmented period controls
 *
 * Dependencies (already used elsewhere in the app):
 *   npm i lucide-react recharts
 *
 * This file is self-contained mock data + UI. Wire the marked sections
 * up to real endpoints when ready (see `TODO(api)` comments).
 * -----------------------------------------------------------------------
 */

import { useMemo, useState, useEffect } from "react";
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  FileBarChart2,
  MessageSquare,
  Wallet,
  Settings,
  Trash2,
  Moon,
  Palette,
  HelpCircle,
  LogOut,
  Search,
  Bell,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Download,
  FileDown,
  RefreshCw,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  PackageSearch,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  FileText,
  X,
  PanelLeftClose,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Topbar } from "@/app/components/pagetopbar";

/* ------------------------------------------------------------------ */
/*  Tokens                                                             */
/* ------------------------------------------------------------------ */

const ACCENT = "#F39D2E";
const ACCENT_DARK = "#DD8A17";
const ACCENT_SOFT = "#FEF3E2";

/* ------------------------------------------------------------------ */
/*  Mock data — TODO(api): replace with real queries                   */
/* ------------------------------------------------------------------ */

type Period = "Today" | "Week" | "Month" | "Year";
type ReportTab = "Overview" | "Sales" | "Inventory" | "Financial" | "Customers";

const REPORT_TABS: ReportTab[] = ["Overview", "Sales", "Inventory", "Financial", "Customers"];
const PERIODS: Period[] = ["Today", "Week", "Month", "Year"];

const revenueTrend = [
  { month: "Jan", revenue: 298000, profit: 41000 },
  { month: "Feb", revenue: 312500, profit: 46800 },
  { month: "Mar", revenue: 289700, profit: 39200 },
  { month: "Apr", revenue: 334200, profit: 52100 },
  { month: "May", revenue: 351800, profit: 49700 },
  { month: "Jun", revenue: 375440, profit: 53460 },
];

const kpis = [
  {
    label: "Total Revenue",
    value: "LKR 375,440",
    delta: "+6.7%",
    up: true,
    icon: DollarSign,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    spark: [298, 312, 289, 334, 351, 375],
  },
  {
    label: "Net Profit",
    value: "LKR 53,460",
    delta: "+7.6%",
    up: true,
    icon: TrendingUp,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    spark: [41, 46, 39, 52, 49, 53],
  },
  {
    label: "Orders Fulfilled",
    value: "54",
    delta: "+12.5%",
    up: true,
    icon: ShoppingBag,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    spark: [38, 41, 35, 47, 49, 54],
  },
  {
    label: "Inventory Turnover",
    value: "3.4x",
    delta: "-0.3x",
    up: false,
    icon: PackageSearch,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    spark: [3.9, 3.8, 3.6, 3.7, 3.6, 3.4],
  },
];

const topProducts = [
  { name: "Galaxy Smartwatch", sold: 84, revenue: "LKR 73,281", pct: 84, note: null as string | null },
  { name: "Wireless Earbuds", sold: 67, revenue: "LKR 67,026", pct: 67, note: "Low stock — 10 left" },
  { name: "Eco Bottle", sold: 120, revenue: "LKR 60,000", pct: 100, note: null },
  { name: "Fitness Tracker", sold: 45, revenue: "LKR 9,000", pct: 45, note: null },
];

const stockHealth = [
  { label: "In Stock", count: 128, color: "bg-emerald-500", text: "text-emerald-600" },
  { label: "Low Stock", count: 14, color: "bg-amber-500", text: "text-amber-600" },
  { label: "Out of Stock", count: 6, color: "bg-rose-500", text: "text-rose-600" },
];
const stockTotal = stockHealth.reduce((a, s) => a + s.count, 0);

type Status = "Completed" | "Pending" | "Cancelled";

interface SaleRow {
  id: string;
  customer: string;
  initials: string;
  avatarBg: string;
  avatarText: string;
  product: string;
  category: string;
  date: string;
  amount: string;
  status: Status;
}

const avatarPalette = [
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-blue-100", text: "text-blue-700" },
  { bg: "bg-violet-100", text: "text-violet-700" },
  { bg: "bg-emerald-100", text: "text-emerald-700" },
  { bg: "bg-rose-100", text: "text-rose-700" },
];

const rawSales: Omit<SaleRow, "initials" | "avatarBg" | "avatarText">[] = [
  { id: "#ORD-0081", customer: "Nimal Perera", product: "Galaxy Smartwatch", category: "Electronics", date: "01 Jun 2026", amount: "LKR 872.40", status: "Completed" },
  { id: "#ORD-0082", customer: "Sunethra Silva", product: "Wireless Earbuds", category: "Audio", date: "01 Jun 2026", amount: "LKR 1,000.40", status: "Pending" },
  { id: "#ORD-0083", customer: "Kasun Fernando", product: "Eco Bottle", category: "Lifestyle", date: "31 May 2026", amount: "LKR 500.00", status: "Completed" },
  { id: "#ORD-0084", customer: "Dilini Jayawardena", product: "Fitness Tracker", category: "Fitness", date: "31 May 2026", amount: "LKR 200.00", status: "Completed" },
  { id: "#ORD-0085", customer: "Roshan Bandara", product: "Wireless Earbuds", category: "Audio", date: "30 May 2026", amount: "LKR 1,000.40", status: "Cancelled" },
  { id: "#ORD-0086", customer: "Amali Wickramasinghe", product: "Galaxy Smartwatch", category: "Electronics", date: "30 May 2026", amount: "LKR 872.40", status: "Completed" },
  { id: "#ORD-0087", customer: "Tharaka Gunasekara", product: "Eco Bottle", category: "Lifestyle", date: "29 May 2026", amount: "LKR 500.00", status: "Pending" },
  { id: "#ORD-0088", customer: "Chamari Rathnayake", product: "Fitness Tracker", category: "Fitness", date: "28 May 2026", amount: "LKR 200.00", status: "Completed" },
  { id: "#ORD-0089", customer: "Isuru Madushanka", product: "Galaxy Smartwatch", category: "Electronics", date: "28 May 2026", amount: "LKR 872.40", status: "Completed" },
  { id: "#ORD-0090", customer: "Hasini Perera", product: "Wireless Earbuds", category: "Audio", date: "27 May 2026", amount: "LKR 1,000.40", status: "Completed" },
];

const salesRows: SaleRow[] = rawSales.map((r, i) => {
  const palette = avatarPalette[i % avatarPalette.length];
  const initials = r.customer
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return { ...r, initials, avatarBg: palette.bg, avatarText: palette.text };
});

interface SavedReport {
  name: string;
  type: "PDF" | "XLSX" | "CSV";
  generated: string;
  size: string;
  frequency: string;
}

const savedReports: SavedReport[] = [
  { name: "Monthly Sales Summary — June 2026", type: "PDF", generated: "01 Jun 2026", size: "1.2 MB", frequency: "Monthly" },
  { name: "Inventory Stock Report — Q2 2026", type: "XLSX", generated: "30 May 2026", size: "860 KB", frequency: "Quarterly" },
  { name: "Financial Statement — May 2026", type: "PDF", generated: "01 May 2026", size: "980 KB", frequency: "Monthly" },
  { name: "Customer Purchase Report — June 2026", type: "CSV", generated: "05 Jun 2026", size: "340 KB", frequency: "Weekly" },
  { name: "Expense Breakdown — May 2026", type: "PDF", generated: "01 May 2026", size: "610 KB", frequency: "Monthly" },
];

/* ------------------------------------------------------------------ */
/*  Small building blocks                                              */
/* ------------------------------------------------------------------ */

function Sparkline({ data, up }: { data: number[]; up: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 28 - ((v - min) / range) * 24 - 2;
      return `${x},${y}`;
    })
    .join(" ");
  const color = up ? "#059669" : "#E11D48";
  return (
    <svg viewBox="0 0 100 30" className="h-8 w-20" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatusPill({ status }: { status: Status }) {
  const styles: Record<Status, string> = {
    Completed: "bg-emerald-50 text-emerald-600",
    Pending: "bg-amber-50 text-amber-600",
    Cancelled: "bg-rose-50 text-rose-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}

function fileIcon(type: SavedReport["type"]) {
  if (type === "XLSX") return { Icon: FileSpreadsheet, bg: "bg-emerald-50", color: "text-emerald-600" };
  if (type === "CSV") return { Icon: FileSpreadsheet, bg: "bg-blue-50", color: "text-blue-600" };
  return { Icon: FileText, bg: "bg-rose-50", color: "text-rose-600" };
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("Overview");
  const [period, setPeriod] = useState<Period>("Month");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const [categoryBreakdown, setCategoryBreakdown] = useState<
  { name: string; value: number; color: string }[]
>([]);

  useEffect(() => {
    fetch(`/api/revenue_by_category`)
      .then((res) => res.json())
      .then((data) => setCategoryBreakdown(data.categoryBreakdown ?? []))
      .catch(console.error);
  }, []);

  const pageSize = 5;

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return salesRows;
    return salesRows.filter(
      (r) =>
        r.customer.toLowerCase().includes(q) ||
        r.product.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  function handleExportCSV() {
    const header = ["Order", "Customer", "Product", "Category", "Date", "Amount", "Status"];
    const lines = filteredRows.map((r) => [r.id, r.customer, r.product, r.category, r.date, r.amount, r.status].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-report-${period.toLowerCase()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex h-screen w-full bg-zinc-100 font-sans text-zinc-900 antialiased">
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar />

        <main className="flex-1 px-6 py-6 lg:px-8">
          {/* Report category tabs + actions */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-1 overflow-x-auto">
              {REPORT_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative whitespace-nowrap px-3.5 py-2 text-[13.5px] font-semibold transition-colors ${
                    activeTab === tab ? "text-zinc-900" : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span
                      className="absolute inset-x-3 -bottom-[1px] h-[2.5px] rounded-full"
                      style={{ backgroundColor: ACCENT }}
                    />
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                <FileDown className="h-4 w-4" /> Export CSV
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-[13px] font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                <Download className="h-4 w-4" /> Export PDF
              </button>
              <button className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-zinc-800">
                <SlidersHorizontal className="h-4 w-4" /> Generate Report
              </button>
            </div>
          </div>

          {/* Search + period control */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search order, customer, or product..."
                className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-[13.5px] text-zinc-700 placeholder:text-zinc-400 focus:border-[#F39D2E] focus:outline-none focus:ring-2 focus:ring-amber-100"
              />
            </div>
            <div className="flex items-center gap-1 rounded-full border border-zinc-200 bg-white p-1">
              {PERIODS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${
                    period === p ? "text-white" : "text-zinc-500 hover:text-zinc-700"
                  }`}
                  style={period === p ? { backgroundColor: ACCENT } : undefined}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* KPI cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{kpi.label}</p>
                    <p className="mt-1.5 text-[22px] font-bold text-zinc-900">{kpi.value}</p>
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${kpi.iconBg}`}>
                    <kpi.icon className={`h-4.5 w-4.5 ${kpi.iconColor}`} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-0.5 text-[12.5px] font-semibold ${
                      kpi.up ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {kpi.up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                    {kpi.delta}
                  </span>
                  <Sparkline data={kpi.spark} up={kpi.up} />
                </div>
              </div>
            ))}
          </div>

          {/* Trend chart + category breakdown */}
          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-[14.5px] font-bold text-zinc-900">Revenue &amp; Profit Trend</h2>
                <span className="flex items-center gap-1 text-[12px] font-medium text-zinc-400">
                  <RefreshCw className="h-3.5 w-3.5" /> Jan – Jun 2026
                </span>
              </div>
              <p className="mb-4 text-[12px] text-zinc-400">Monthly revenue against net profit, in LKR.</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueTrend} margin={{ top: 5, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#111827" stopOpacity={0.18} />
                        <stop offset="100%" stopColor="#111827" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke="#F1F1F2" />
                    <XAxis
                      dataKey="month"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#A1A1AA" }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#A1A1AA" }}
                      tickFormatter={(v) => `${v / 1000}k`}
                      domain={[0, 400000]}
                      ticks={[0, 100000, 200000, 300000, 400000]}
                      width={44}
                    />
                    <Tooltip
                      formatter={(value: any, name: any) => [
                        `LKR ${Number(value || 0).toLocaleString()}`,
                        name === "revenue" ? "Revenue" : "Profit",
                      ]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #E4E4E7",
                        fontSize: 12.5,
                        boxShadow: "0 4px 14px rgba(0,0,0,0.06)",
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke={ACCENT} strokeWidth={2.5} fill="url(#revFill)" />
                    <Area type="monotone" dataKey="profit" stroke="#111827" strokeWidth={2} fill="url(#profitFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex items-center gap-5">
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} /> Revenue
                </span>
                <span className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-500">
                  <span className="h-2 w-2 rounded-full bg-zinc-900" /> Profit
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="mb-1 text-[14.5px] font-bold text-zinc-900">Sales by Category</h2>
              <p className="mb-2 text-[12px] text-zinc-400">Share of revenue this {period.toLowerCase()}.</p>

              {categoryBreakdown.length === 0 ? (
                <div className="flex h-[180px] items-center justify-center text-[12.5px] text-zinc-400">
                  No sales data yet
                </div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <PieChart width={180} height={180}>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="value"
                        nameKey="name"
                        cx={90}
                        cy={90}
                        innerRadius={52}
                        outerRadius={72}
                        paddingAngle={2}
                        stroke="none"
                        isAnimationActive={false}
                      >
                        {categoryBreakdown.map((c) => (
                          <Cell key={c.name} fill={c.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: any, n: any) => [`${v}%`, n]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                    </PieChart>
                  </div>
                  <div className="mt-1 space-y-2">
                    {categoryBreakdown.map((c) => (
                      <div key={c.name} className="flex items-center justify-between text-[12.5px]">
                        <span className="flex items-center gap-2 text-zinc-600">
                          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                          {c.name}
                        </span>
                        <span className="font-semibold text-zinc-800">{c.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Detailed table + side panels */}
          <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm xl:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[14.5px] font-bold text-zinc-900">{activeTab} Report</h2>
                <span className="text-[12px] font-medium text-zinc-400">
                  {filteredRows.length} record{filteredRows.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] border-collapse text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      <th className="pb-3 pr-3">Order</th>
                      <th className="pb-3 pr-3">Customer</th>
                      <th className="pb-3 pr-3">Product</th>
                      <th className="pb-3 pr-3">Date</th>
                      <th className="pb-3 pr-3">Amount</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {pagedRows.map((row) => (
                      <tr key={row.id} className="text-[13px]">
                        <td className="py-3 pr-3 font-medium text-zinc-800">{row.id}</td>
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-[10.5px] font-bold ${row.avatarBg} ${row.avatarText}`}
                            >
                              {row.initials}
                            </span>
                            <span className="text-zinc-700">{row.customer}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-3">
                          <p className="text-zinc-700">{row.product}</p>
                          <p className="text-[11px] text-zinc-400">{row.category}</p>
                        </td>
                        <td className="py-3 pr-3 text-zinc-500">{row.date}</td>
                        <td className="py-3 pr-3 font-semibold text-zinc-800">{row.amount}</td>
                        <td className="py-3">
                          <StatusPill status={row.status} />
                        </td>
                      </tr>
                    ))}
                    {pagedRows.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[13px] text-zinc-400">
                          No records match “{query}”.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4">
                <p className="text-[12px] text-zinc-400">
                  Page {page} of {pageCount}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page === pageCount}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right column: Top products + Stock health */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-[14.5px] font-bold text-zinc-900">Top Products</h2>
                  <a href="#" className="flex items-center text-[12px] font-semibold" style={{ color: ACCENT }}>
                    View All <ChevronRight className="h-3.5 w-3.5" />
                  </a>
                </div>
                <div className="space-y-4">
                  {topProducts.map((p) => (
                    <div key={p.name}>
                      <div className="mb-1.5 flex items-center justify-between text-[13px]">
                        <div>
                          <p className="font-semibold text-zinc-800">{p.name}</p>
                          <p className="text-[11px] text-zinc-400">
                            {p.sold} sold · {p.revenue}
                          </p>
                        </div>
                        <span className="text-[12.5px] font-bold text-zinc-700">{p.pct}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${p.pct}%`, background: `linear-gradient(90deg, #FFCB73, ${ACCENT})` }}
                        />
                      </div>
                      {p.note && (
                        <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> {p.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-[14.5px] font-bold text-zinc-900">Stock Health</h2>
                <div className="mb-4 flex h-2.5 w-full overflow-hidden rounded-full bg-zinc-100">
                  {stockHealth.map((s) => (
                    <div key={s.label} className={s.color} style={{ width: `${(s.count / stockTotal) * 100}%` }} />
                  ))}
                </div>
                <div className="space-y-3">
                  {stockHealth.map((s) => (
                    <div key={s.label} className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-2 text-zinc-600">
                        <span className={`h-2 w-2 rounded-full ${s.color}`} />
                        {s.label}
                      </span>
                      <span className={`font-semibold ${s.text}`}>{s.count} SKUs</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Saved / scheduled reports */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-[14.5px] font-bold text-zinc-900">Saved &amp; Scheduled Reports</h2>
                <p className="text-[12px] text-zinc-400">Previously generated reports, ready to download anytime.</p>
              </div>
              <button className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-2 text-[12.5px] font-semibold text-zinc-700 hover:bg-zinc-50">
                <SlidersHorizontal className="h-3.5 w-3.5" /> Manage schedules
              </button>
            </div>

            <div className="divide-y divide-zinc-100">
              {savedReports.map((r) => {
                const { Icon, bg, color } = fileIcon(r.type);
                return (
                  <div key={r.name} className="flex items-center justify-between gap-4 py-3.5">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                        <Icon className={`h-4.5 w-4.5 ${color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-[13.5px] font-semibold text-zinc-800">{r.name}</p>
                        <p className="text-[11.5px] text-zinc-400">
                          {r.type} · {r.size} · Generated {r.generated}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold text-zinc-500 sm:inline-block">
                        {r.frequency}
                      </span>
                      <button
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                        aria-label={`Download ${r.name}`}
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}