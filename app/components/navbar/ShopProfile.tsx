'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronsUpDown, Plus, Store } from 'lucide-react';
import { useSession } from "next-auth/react";

type Shop = {
  id: number;
  name: string;
  currency: string;
  location: string;
  isActive: boolean;
  ownerId: number;
  createdAt: string;
  updatedAt: string;
};

type ShopProfileProps = {
  compact?: boolean;
  hasShop: boolean;
  session: any; 
};

export default function ShopProfile({ compact = false, hasShop, session }: ShopProfileProps) {
  const { update } = useSession();

  const [isOpen, setIsOpen] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false); 
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch shops ONLY when the dropdown is opened for the first time
  useEffect(() => {
    if (isOpen && !hasFetched && hasShop) {
      const fetchShops = async () => {
        setIsLoading(true);
        try {
          const response = await fetch('/api/shops');
          const data = await response.json();
          if (data.shops) {
            setShops(data.shops);
          }
        } catch (error) {
          console.error("Failed to fetch shops:", error);
        } finally {
          setIsLoading(false);
          setHasFetched(true); 
        }
      };

      fetchShops();
    }
  }, [isOpen, hasFetched, hasShop]);

  // Compact State (Sidebar Collapsed)
  if (compact) {
    return (
      <div className="flex justify-center py-3">
        {hasShop ? (
          <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
            <img src="/api/placeholder/32/32" alt="User Avatar" className="w-full h-full object-cover" />
          </div>
        ) : (
          <Link
            href="/pages/shop/create"
            title="Create your shop"
            className="w-8 h-8 rounded-full bg-[#1c222b] flex items-center justify-center hover:bg-gray-800"
          >
            <Plus size={16} className="text-white" />
          </Link>
        )}
      </div>
    );
  }

  // Expanded State - User has a shop
  if (hasShop) {
    return (
      <div className="relative mx-4 mt-3" ref={dropdownRef}>
        {/* Main Profile Button */}
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-3 border border-gray-200 bg-white flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
              <img src="/api/placeholder/32/32" alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-gray-900 leading-none truncate">
                {session?.user?.shopName ?? 'My Shop'}
              </span>
              <span className="text-[10px] text-gray-500 mt-1 truncate">
                {session?.user?.email}
              </span>
            </div>
          </div>
          <ChevronsUpDown size={14} className="text-gray-500 flex-shrink-0" />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2 max-h-60 overflow-y-auto">
            <div className="px-3 pb-2 mb-2 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Your Shops
            </div>
            
            {isLoading ? (
              <div className="px-4 py-3 text-xs text-gray-500 text-center animate-pulse">
                Loading shops...
              </div>
            ) : shops.length > 0 ? (
              shops.map((shop) => (
                <div 
                  key={shop.id} 
                  className="px-3 py-2 mx-1 hover:bg-gray-50 cursor-pointer rounded-md flex items-center gap-3 transition-colors"
                  onClick={async () => {
                    console.log("Selected shop:", shop.name);
                    setIsOpen(false); 
                    await update({
                      shopId: shop.id,
                      shopName: shop.name
                    });
                    // Refresh the current page
                    window.location.reload();
                  }}
                >
                  <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Store size={12} className="text-gray-600" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-medium text-gray-900 truncate">{shop.name}</span>
                    <span className="text-[10px] text-gray-500">{shop.currency}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-xs text-gray-500 text-center">
                No shops found.
              </div>
            )}

            {/* Create New Shop Link at Bottom */}
            <div className="mt-2 pt-2 border-t border-gray-100 px-1">
               <Link
                  href="/pages/shop/create"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                >
                  <Plus size={14} className="text-gray-500" />
                  Create new shop
               </Link>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Expanded State - User does NOT have a shop yet
  return (
    <Link
      href="/pages/shop/create"
      className="mx-4 mt-3 flex items-center gap-3 px-4 py-3 border border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors rounded-lg"
    >
      <div className="w-8 h-8 rounded-full bg-[#1c222b] flex items-center justify-center flex-shrink-0">
        <Plus size={16} className="text-white" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-bold text-gray-900 leading-none">Create your shop</span>
        <span className="text-[10px] text-gray-500 mt-1">Set up to get started</span>
      </div>
    </Link>
  );
}