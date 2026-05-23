import React from "react";
import { User } from "../types";
import { ShoppingBag, Search, LogOut, LogIn, User as UserIcon, ShieldAlert, Package, ArchiveRestore } from "lucide-react";

interface NavbarProps {
  user: User | null;
  cartCount: number;
  onCartOpen: () => void;
  onAuthClick: () => void;
  onLogout: () => void;
  onCategoryChange: (category: string) => void;
  currentCategory: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNavigate: (view: "catalog" | "orders" | "admin") => void;
  currentView: "catalog" | "orders" | "admin";
}

export default function Navbar({
  user,
  cartCount,
  onCartOpen,
  onAuthClick,
  onLogout,
  onCategoryChange,
  currentCategory,
  searchQuery,
  onSearchChange,
  onNavigate,
  currentView,
}: NavbarProps) {
  const categories = ["All", "Audio", "Accessories", "Office", "Kitchen", "Travel"];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => onNavigate("catalog")}
            className="flex cursor-pointer items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-100">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-lg font-bold tracking-tight text-slate-900">
                AeroStore
              </span>
              <span className="hidden sm:inline-block ml-1.5 rounded-sm bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                FullStack v1
              </span>
            </div>
          </div>

          {/* Search Box (Only on catalog page) */}
          <div className="hidden md:flex max-w-md flex-1 items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-slate-400 border border-transparent focus-within:border-slate-200 focus-within:bg-white focus-within:shadow-xs transition-all">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => {
                onNavigate("catalog");
                onSearchChange(e.target.value);
              }}
            />
          </div>

          {/* User Account Controls & Actions */}
          <div className="flex items-center gap-3">
            {/* View Admin Panel Toggle (for Admin) */}
            {user && user.role === "admin" && (
              <button
                onClick={() => onNavigate("admin")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold tracking-wide border transition-all ${
                  currentView === "admin"
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Admin Panel</span>
              </button>
            )}

            {/* View Orders Tracking Link (for any logged user) */}
            {user && (
              <button
                onClick={() => onNavigate("orders")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold tracking-wide border transition-all ${
                  currentView === "orders"
                    ? "bg-slate-150 border-slate-300 text-slate-800"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Package className="h-3.5 w-3.5" />
                <span>Orders</span>
              </button>
            )}

            {/* Shopping Cart Trigger */}
            {currentView !== "admin" && (
              <button
                onClick={onCartOpen}
                className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:shadow-xs transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* User Dropdown / Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-1 border-l border-slate-100">
                <div className="hidden lg:block text-right">
                  <div className="text-xs font-semibold text-slate-800">{user.name}</div>
                  <div className="text-[10px] font-medium text-indigo-600 capitalize">
                    {user.role} Account
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                  <UserIcon className="h-4 w-4" />
                </div>
                <button
                  onClick={onLogout}
                  title="Logout Session"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all ml-1"
                >
                  <LogIn className="h-4 w-4 rotate-180" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-all"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Box & Categories Tab Panel */}
        <div className="flex flex-col gap-2 py-3 border-t border-slate-50 md:hidden">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-slate-400 border border-transparent">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search catalog products..."
              className="w-full bg-transparent text-sm text-slate-755 outline-none placeholder:text-slate-400"
              value={searchQuery}
              onChange={(e) => {
                onNavigate("catalog");
                onSearchChange(e.target.value);
              }}
            />
          </div>
        </div>

        {/* Category Tabs Panel (for Shop/Catalog View Only) */}
        {currentView === "catalog" && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`cursor-pointer px-3.5 py-1 text-xs font-semibold rounded-lg tracking-wide transition-all whitespace-nowrap ${
                  currentCategory === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
