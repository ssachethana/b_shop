'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ShopProfile from './ShopProfile'; // Adjust this import path if they are in different folders

import {
  LayoutDashboard,
  BarChart2,
  TrendingUp,
  FileText,
  MessageCircle,
  Wallet,
  Settings,
  Trash2,
  Moon,
  Palette,
  HelpCircle,
  LogOut,
  PanelRightClose,
  PanelLeftClose,
  Sparkles,
  X,
  Menu,
} from 'lucide-react';

type MenuItem = {
  name: string;
  icon: React.ReactNode;
  href: string;
};

const MAIN_MENU: MenuItem[] = [
  { name: 'Dashboard', icon: <LayoutDashboard size={18} />, href: '/pages/dashboard' },
  { name: 'Products',  icon: <BarChart2 size={18} />,      href: '/pages/products' },
  { name: 'Sales',     icon: <TrendingUp size={18} />,     href: '/pages/sales' },
  { name: 'Reports',   icon: <FileText size={18} />,       href: '/pages/reports' },
  { name: 'Messages',  icon: <MessageCircle size={18} />,  href: '#' },
  { name: 'My wallet', icon: <Wallet size={18} />,         href: '#' },
  { name: 'Setting',   icon: <Settings size={18} />,       href: '#' },
  { name: 'Trash',     icon: <Trash2 size={18} />,         href: '#' },
];

const MOBILE_MENU = MAIN_MENU.slice(0, 5);

export default function Sidebar() {
  const pathname = usePathname();

  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [collapsed, setCollapsed]     = useState(false);
  const [isMobile, setIsMobile]       = useState(false);
  const [isTablet, setIsTablet]       = useState(false);

  const { data: session } = useSession();
  const hasShop = !!session?.user?.shopId;

  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 640);
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);

  // Determines whether a given menu item should be highlighted as active,
  // based on the current route. '#' placeholder links are never active.
  const isItemActive = (href: string) => {
    if (!pathname || href === '#') return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  /* ─────────────────────────── SHARED SIDEBAR CONTENT ──────────────────────── */
  const SidebarContent = ({ compact = false }: { compact?: boolean }) => (
    <aside
      className={`
        flex flex-col h-full bg-[#fafafa] border-r border-gray-200 text-gray-600 font-sans
        transition-all duration-300
        ${compact ? 'w-16' : 'w-64'}
      `}
    >
      {/* Header / Logo */}
      <div className="relative overflow-hidden z-0 min-h-[80px] flex-shrink-0">
        <Image
          src="/bitsshoplogo.png"
          fill
          className="object-cover object-center -z-10"
          alt="Header Background"
          priority
        />
        <div className="flex items-center justify-end p-3 relative z-10">
          {!compact && (
            <button
              onClick={() => { setCollapsed(true); setDrawerOpen(false); }}
              className="p-1 bg-white/50 backdrop-blur-sm hover:bg-white/80 rounded text-gray-700 transition-all shadow-sm"
              aria-label="Collapse sidebar"
            >
              <PanelRightClose size={18} />
            </button>
          )}
          {compact && (
            <button
              onClick={() => setCollapsed(false)}
              className="p-1 bg-white/50 backdrop-blur-sm hover:bg-white/80 rounded text-gray-700 transition-all shadow-sm"
              aria-label="Expand sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Extracted Shop Profile Component */}
      <ShopProfile compact={compact} hasShop={hasShop} session={session} />

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-4 no-scrollbar">
        <div className={compact ? 'px-2' : 'px-4'}>
          {!compact && (
            <p className="px-2 text-xs font-semibold text-gray-400 tracking-wider mb-3">MENU</p>
          )}
          <nav className="flex flex-col gap-1">
            {MAIN_MENU.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={compact ? item.name : undefined}
                  className={`
                    flex items-center gap-3 rounded-lg transition-all duration-200
                    ${compact ? 'justify-center px-2 py-2.5' : 'px-3 py-2'}
                    ${active
                      ? 'bg-white text-gray-900 border border-gray-200 shadow-sm font-semibold'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 font-medium'}
                  `}
                >
                  <span className={active ? 'text-gray-800' : 'text-gray-400'}>
                    {item.icon}
                  </span>
                  {!compact && <span className="text-[13px]">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Promo Card */}
        {!compact && (
          <div className="px-4 mt-auto">
            <div className="relative bg-[#fff8e7] border border-yellow-100 rounded-xl p-4 text-center">
              <button className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-sm hover:bg-gray-800">
                <X size={12} />
              </button>
              <div className="flex justify-center mb-2">
                <div className="bg-yellow-400 p-2 rounded-full text-white">
                  <Sparkles size={16} />
                </div>
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">BIT Tool</h4>
              <p className="text-[10px] text-gray-600 mb-3 leading-relaxed">
                There are many variations of passages of Lorem Ipsum available
              </p>
              <button className="w-full bg-[#1c222b] text-white text-xs py-2 rounded-md hover:bg-gray-800 transition-colors flex justify-center items-center">
                →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className={`pb-4 pt-3 border-t border-gray-200 flex flex-col gap-1 ${compact ? 'px-2' : 'px-4'}`}>
        {compact ? (
          <>
            <button className="flex justify-center py-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Dark mode"><Moon size={18} /></button>
            <button className="flex justify-center py-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Themes"><Palette size={18} /></button>
            <button className="flex justify-center py-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Help">
              <span className="relative">
                <HelpCircle size={18} />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">5</span>
              </span>
            </button>
            <button className="flex justify-center py-2 text-[#ff4d4f] hover:bg-[#fff1f0] rounded-lg" title="Log out"><LogOut size={18} /></button>
          </>
        ) : (
          <>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
              <Moon size={18} className="text-gray-500" />
              <span className="text-[13px]">Dark mode</span>
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
              <Palette size={18} className="text-gray-500" />
              <span className="text-[13px]">Themes</span>
            </Link>
            <Link href="#" className="flex items-center justify-between px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
              <div className="flex items-center gap-3">
                <HelpCircle size={18} className="text-gray-500" />
                <span className="text-[13px]">Help</span>
              </div>
              <span className="bg-yellow-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">5</span>
            </Link>
            <button className="flex items-center gap-3 px-3 py-2 mt-2 text-[#ff4d4f] hover:bg-[#fff1f0] rounded-lg transition-colors font-medium w-full">
              <LogOut size={18} />
              <span className="text-[13px]">Log out</span>
            </button>
          </>
        )}
      </div>
    </aside>
  );

  /* ─────────────────────────── MOBILE BOTTOM NAV ────────────────────────────── */
  if (isMobile) {
    return (
      <>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={closeDrawer}
            />
            <div className="relative z-10 h-full animate-slide-in-left">
              <SidebarContent />
              <button
                onClick={closeDrawer}
                className="absolute top-3 right-3 z-20 p-1 bg-white/70 rounded text-gray-700 hover:bg-white"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 flex items-center justify-around px-2 py-1 safe-area-bottom">
          {MOBILE_MENU.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
                  active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className={active ? 'bg-[#1c222b] text-white p-1.5 rounded-lg' : ''}>
                  {item.icon}
                </span>
                <span className="text-[9px] font-medium leading-none">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-gray-400 hover:text-gray-600"
            aria-label="Open menu"
          >
            <Menu size={18} />
            <span className="text-[9px] font-medium leading-none">More</span>
          </button>
        </nav>
      </>
    );
  }

  /* ─────────────────────────── TABLET HAMBURGER ─────────────────────────────── */
  if (isTablet) {
    return (
      <>
        {!drawerOpen && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="fixed top-4 left-4 z-50 p-2 bg-white border border-gray-200 rounded-lg shadow-md text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        )}

        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={closeDrawer}
            />
            <div className="relative z-10 h-full shadow-xl animate-slide-in-left">
              <SidebarContent />
            </div>
          </div>
        )}
      </>
    );
  }

  /* ─────────────────────────── DESKTOP FULL SIDEBAR ─────────────────────────── */
  return <SidebarContent compact={collapsed} />;
}