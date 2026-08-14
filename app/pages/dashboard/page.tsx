"use client";

import { useState } from "react";
import { Period } from "../../components/dashboard/types";
import { recentSales, topProducts, recentExpenses } from "../../components/dashboard/Mock";
import { buildStats } from "../../components/dashboard/buildStats";
import { useShopAnalytics } from "../../components/dashboard/Useshopanalytics";

import {Topbar}  from "@/app/components/pagetopbar";
import { SearchBar } from "../../components/dashboard/Searchbar";
import { PageHeader } from "../../components/dashboard/Pageheader";
import { PeriodToolbar } from "../../components/dashboard/Periodtoolbar";
import { ErrorBanner } from "../../components/dashboard/Errorbanner";
import { StatCardsGrid } from "../../components/dashboard/ Statcardsgrid";
import { RecentSalesTable } from "../../components/dashboard/Recentsalestable";
import { TopProductsCard } from "../../components/dashboard/Topproductscard";
import { RecentExpensesCard } from "../../components/dashboard/Recentexpensescard";
import { QuickActions } from "../../components/dashboard/Quickactions";
import { AddExpenseModal } from "../../components/addexpensemodal";
import { AddCustomerModal } from "../../components/ addcustomermodal";

export default function DashboardPage() {
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [period, setPeriod] = useState<Period>("month");

  const { analytics, loading, error, refetch } = useShopAnalytics();

  const stats = analytics ? buildStats(analytics, period) : [];

  return (
    <div className="min-h-screen bg-[#F4F4F4] font-sans">
      <Topbar/>
      <SearchBar />

      {/* UPDATED: Changed px-8 to px-4 sm:px-8 for better mobile padding */}
      <main className="px-4 sm:px-8 py-6 space-y-6">
        <PageHeader
          onAddExpense={() => setShowExpenseModal(true)}
          onAddCustomer={() => setShowCustomerModal(true)}
        />

        <PeriodToolbar
          period={period}
          onPeriodChange={setPeriod}
          loading={loading}
          onRefresh={refetch}
        />

        {error && <ErrorBanner message={error} onRetry={refetch} />}

        <StatCardsGrid loading={loading} stats={stats} />

        {/* UPDATED: Changed grid-cols-3 to 1 column on mobile, 3 on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* UPDATED: Sales table takes 2 columns on desktop, 1 on mobile */}
          <div className="lg:col-span-2">
            <RecentSalesTable sales={recentSales} />
          </div>

          {/* UPDATED: Side cards take 1 column and wrap nicely */}
          <div className="flex flex-col gap-5 lg:col-span-1">
            <TopProductsCard products={topProducts} />
            <RecentExpensesCard
              expenses={recentExpenses}
              onAddExpense={() => setShowExpenseModal(true)}
            />
          </div>
        </div>

        <QuickActions
          onAddExpense={() => setShowExpenseModal(true)}
          onAddCustomer={() => setShowCustomerModal(true)}
        />
      </main>

      {showExpenseModal && <AddExpenseModal onClose={() => setShowExpenseModal(false)} />}
      {showCustomerModal && <AddCustomerModal onClose={() => setShowCustomerModal(false)} />}
    </div>
  );
}