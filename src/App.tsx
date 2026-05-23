import React, { useState, useEffect } from "react";
import { Product, Order, User, CartItem, OrderStatus } from "./types";
import { api } from "./api";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import CartSidebar from "./components/CartSidebar";
import CheckoutView from "./components/CheckoutView";
import OrderHistoryView from "./components/OrderHistoryView";
import AdminDashboardView from "./components/AdminDashboardView";
import AuthModal from "./components/AuthModal";
import ProductDetailModal from "./components/ProductDetailModal";
import { getProductRating } from "./utils/productDetails";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, ChevronRight, Sparkles, HeartHandshake, ShieldCheck, HelpCircle, ArrowRight } from "lucide-react";

export default function App() {
  // Core Data State
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  // Navigation Filter parameters
  const [currentCategory, setCurrentCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "rating_desc">("default");
  const [currentView, setCurrentView] = useState<"catalog" | "orders" | "admin">("catalog");

  // Interaction State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [checkoutMode, setCheckoutMode] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Layout Loading / Feedback parameters
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  // Authentication & Products recover
  useEffect(() => {
    const initializeStore = async () => {
      setLoading(true);
      setError(null);
      try {
        // Recover user session from localStorage
        const token = localStorage.getItem("store_auth_token");
        if (token) {
          try {
            const userData = await api.me();
            setUser(userData);
          } catch (_) {
            // Token expired or invalid, clear quietly
            localStorage.removeItem("store_auth_token");
          }
        }

        // Fetch products catalog
        await refreshCatalog();
      } catch (err: any) {
        setError(err.message || "Failed to initialize e-commerce application.");
      } finally {
        setLoading(false);
      }
    };

    initializeStore();

    // Recover Cart from local storage
    const storedCart = localStorage.getItem("aero_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (_) {}
    }
  }, []);

  // Update localStorage when cart changes
  useEffect(() => {
    localStorage.setItem("aero_cart", JSON.stringify(cart));
  }, [cart]);

  // Sync / Fetch user orders whenever user state changes
  useEffect(() => {
    if (user) {
      refreshOrders();
    } else {
      setOrders([]);
    }
  }, [user]);

  // Methods to communicate with REST backend
  const refreshCatalog = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (err: any) {
      console.error("Error refreshing catalog:", err);
    }
  };

  const refreshOrders = async () => {
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err: any) {
      console.error("Error refreshing orders:", err);
    }
  };

  const triggerToast = (msg: string) => {
    setBannerNotice(msg);
    setTimeout(() => {
      setBannerNotice(null);
    }, 3800);
  };

  // Auth Success Handler
  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setIsAuthModalOpen(false);
    triggerToast(`Welcome back, ${authenticatedUser.name}!`);
  };

  // Log out State
  const handleLogout = () => {
    localStorage.removeItem("store_auth_token");
    setUser(null);
    setCart([]);
    setOrders([]);
    setCurrentView("catalog");
    setCheckoutMode(false);
    triggerToast("Logged out successfully.");
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    const existingIndex = cart.findIndex((item) => item.product.id === product.id);
    const availableStock = product.stock;

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      const newQuantity = updatedCart[existingIndex].quantity + quantity;

      if (newQuantity > availableStock) {
        triggerToast(`Oops! Only ${availableStock} units of ${product.name} are available.`);
        updatedCart[existingIndex].quantity = availableStock;
      } else {
        updatedCart[existingIndex].quantity = newQuantity;
        triggerToast(`Added more ${product.name} to your cart.`);
      }
      setCart(updatedCart);
    } else {
      setCart([...cart, { product, quantity }]);
      triggerToast(`Added ${product.name} to card.`);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    const updated = cart.map((item) => {
      if (item.product.id === productId) {
        return {
          ...item,
          quantity: Math.min(Math.max(1, quantity), item.product.stock),
        };
      }
      return item;
    });
    setCart(updated);
  };

  const handleRemoveItem = (productId: string) => {
    const filtered = cart.filter((item) => item.product.id !== productId);
    setCart(filtered);
    triggerToast("Item removed from cart.");
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      setIsCartOpen(false);
      setIsAuthModalOpen(true);
      triggerToast("Please login or create an account to proceed with checkout.");
    } else {
      setIsCartOpen(false);
      setCheckoutMode(true);
    }
  };

  const handlePlaceOrder = async (shippingAddress: any, paymentMethod: string, finalTotal?: number) => {
    if (!user) throw new Error("No authenticated session found.");

    const defaultTotal = cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0) * 1.08 + (cart.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0) > 150 ? 0 : 15);

    const orderPayload = {
      items: cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      shippingAddress,
      paymentMethod,
      totalAmount: finalTotal !== undefined ? finalTotal : defaultTotal,
    };

    const newOrder = await api.createOrder(orderPayload);
    setCart([]);
    await refreshCatalog();
    await refreshOrders();
    return newOrder;
  };

  const handleOrderCompleted = () => {
    setCheckoutMode(false);
    setCheckoutSuccess(true);
  };

  // Admin Dashboard actions proxy to api layer
  const handleAdminCreate = async (payload: Omit<Product, "id">) => {
    const res = await api.createProduct(payload);
    await refreshCatalog();
    return res;
  };

  const handleAdminUpdate = async (id: string, payload: Partial<Product>) => {
    const res = await api.updateProduct(id, payload);
    await refreshCatalog();
    return res;
  };

  const handleAdminDelete = async (id: string) => {
    const res = await api.deleteProduct(id);
    await refreshCatalog();
    return res;
  };

  const handleAdminUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    const res = await api.updateOrderStatus(id, status);
    await refreshOrders();
    await refreshCatalog(); // stock values might flow back
    return res;
  };

  // Nav views orchestrations
  const handleNavigate = (view: "catalog" | "orders" | "admin") => {
    setCheckoutMode(false);
    setCheckoutSuccess(false);
    setCurrentView(view);
  };

  // Categorized product filters
  const sortedAndFilteredProducts = products
    .filter((p) => {
      const matchCat = currentCategory === "All" || p.category.toLowerCase() === currentCategory.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") {
        return a.price - b.price;
      }
      if (sortBy === "price_desc") {
        return b.price - a.price;
      }
      if (sortBy === "rating_desc") {
        const ratingA = getProductRating(a.id).average;
        const ratingB = getProductRating(b.id).average;
        return ratingB - ratingA;
      }
      return 0; // default stability
    });

  const featuredProducts = products.filter((p) => p.featured && p.stock > 0);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-indigo-150 selection:text-indigo-900 overflow-x-hidden">
      
      {/* Toast Notification banner */}
      <AnimatePresence>
        {bannerNotice && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 z-50 -translate-x-1/2 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-slate-900 text-white border border-slate-800 rounded-full py-2 px-5 text-xs font-semibold shadow-2xl flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0 select-none animate-pulse" />
              <span>{bannerNotice}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Navbar */}
      <Navbar
        user={user}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onCartOpen={() => setIsCartOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onCategoryChange={setCurrentCategory}
        currentCategory={currentCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onNavigate={handleNavigate}
        currentView={currentView}
      />

      {/* Main Core Router View Panel */}
      <main className="flex-grow">
        {loading ? (
          <div className="flex h-96 flex-col items-center justify-center text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            <p className="mt-4 text-xs font-semibold text-slate-500">Synchronizing AeroStore Catalog...</p>
          </div>
        ) : error ? (
          <div className="mx-auto max-w-md my-16 rounded-2xl border border-rose-100 bg-white p-6 text-center shadow-xs">
            <h3 className="text-sm font-bold text-rose-600">Connectivity Error</h3>
            <p className="mt-1.5 text-xs text-slate-500">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-rose-605 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition-colors"
            >
              Refresh Applet
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* View ROUTE 1: Custom Orders history checklist */}
            {currentView === "orders" && (
              <motion.div
                key="orders"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <OrderHistoryView
                  orders={orders}
                  onRefresh={refreshOrders}
                  userRole={user?.role || "user"}
                />
              </motion.div>
            )}

            {/* View ROUTE 2: Admin Dashboard */}
            {currentView === "admin" && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                <AdminDashboardView
                  products={products}
                  orders={orders}
                  onCreateProduct={handleAdminCreate}
                  onUpdateProduct={handleAdminUpdate}
                  onDeleteProduct={handleAdminDelete}
                  onUpdateOrderStatus={handleAdminUpdateOrderStatus}
                  onRefresh={async () => {
                    await refreshCatalog();
                    await refreshOrders();
                  }}
                />
              </motion.div>
            )}

            {/* View ROUTE 3: Catalog shop area */}
            {currentView === "catalog" && (
              <motion.div
                key="catalog"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pb-16"
              >
                {/* Checkout Funnel Stage */}
                {checkoutMode ? (
                  <CheckoutView
                    user={user!}
                    cartItems={cart}
                    onBackToCart={() => setCheckoutMode(false)}
                    onOrderCompleted={handleOrderCompleted}
                    onPlaceOrder={handlePlaceOrder}
                  />
                ) : checkoutSuccess ? (
                  <div className="mx-auto max-w-lg text-center my-16 bg-white border rounded-2xl p-8 shadow-md">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4 scale-110">
                      <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h2 className="font-display text-xl font-bold text-slate-800">Order Placed Successfully!</h2>
                    <p className="mt-2 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                      Your technical accessories and focus tools are locked. Store logistics have received your transport coordinates.
                    </p>
                    <div className="mt-8 flex justify-center gap-3">
                      <button
                        onClick={() => handleNavigate("orders")}
                        className="cursor-pointer rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-slate-800 transition-colors"
                      >
                        Track Shipment Status
                      </button>
                      <button
                        onClick={() => {
                          setCheckoutSuccess(false);
                          refreshCatalog();
                        }}
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        Return to Catalogue
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Hero Branding Section (Only shown when not searching/filtering) */}
                    {currentCategory === "All" && searchQuery === "" && (
                      <div className="relative overflow-hidden bg-slate-900 py-12 sm:py-16 text-white mb-8 border-b border-slate-850">
                        {/* Background structural glow */}
                        <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl select-none" />
                        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl select-none" />

                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left relative z-10">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full mb-3 mb-4 border border-indigo-400/20">
                            <Sparkles className="h-3 w-3 fill-indigo-400" /> Focus Workspace Equipment
                          </span>
                          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white max-w-2xl leading-none">
                            Precision Tools for Modern Lifestyles
                          </h1>
                          <p className="mt-4 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                            Discover clean, functional workspace peripherals, acoustic gear, and artisanal drip brewing carafes engineered to structure your flow.
                          </p>

                          <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold">
                            <div className="flex h-8 items-center gap-1.5 rounded-lg bg-white/5 border border-white/15 px-3">
                              <ShieldCheck className="h-4 w-4 text-indigo-400" />
                              <span>2-Yr Service Warranty</span>
                            </div>
                            <div className="flex h-8 items-center gap-1.5 rounded-lg bg-white/5 border border-white/15 px-3">
                              <HeartHandshake className="h-4 w-4 text-amber-400" />
                              <span>Free Global Ship over $150</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Featured items band (Only in main view) */}
                    {featuredProducts.length > 0 && currentCategory === "All" && searchQuery === "" && (
                      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10 text-left">
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Featured Store Selections
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {featuredProducts.map((p) => (
                            <ProductCard
                              key={`feat-${p.id}`}
                              product={p}
                              user={user}
                              onAddToCart={(prod) => handleAddToCart(prod)}
                              onProductClick={setSelectedProduct}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Standard Catalogue Grid layout */}
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-3">
                        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-slate-500">
                          {currentCategory} Catalog ({sortedAndFilteredProducts.length})
                        </h3>
                        
                        <div className="flex items-center gap-4">
                          {searchQuery && (
                            <span className="text-xs text-slate-400">
                              Filtering for: <strong className="text-slate-600">"{searchQuery}"</strong>
                            </span>
                          )}
                          
                          {/* Rich Sorting Selector */}
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Sort:</span>
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value as any)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 focus:outline-hidden focus:border-indigo-500 font-semibold cursor-pointer"
                              id="select-catalog-sort"
                            >
                              <option value="default">Default</option>
                              <option value="price_asc">Price: Low to High</option>
                              <option value="price_desc">Price: High to Low</option>
                              <option value="rating_desc">Reviews: Highest Rated</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {sortedAndFilteredProducts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400">
                          <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                          <h4 className="text-sm font-semibold text-slate-700">No matching products</h4>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                            We couldn't locate items under your current category selection or keyword parameters. Let's adjust filters!
                          </p>
                          <button
                            onClick={() => {
                              setCurrentCategory("All");
                              setSearchQuery("");
                            }}
                            className="mt-4 text-xs font-semibold text-indigo-600 hover:underline cursor-pointer"
                          >
                            Reset filters
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {sortedAndFilteredProducts.map((p) => (
                            <ProductCard
                              key={p.id}
                              product={p}
                              user={user}
                              onAddToCart={(prod) => handleAddToCart(prod)}
                              onProductClick={setSelectedProduct}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Slide-out Cart Sidebar Drawer Panel */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleProceedToCheckout}
      />

      {/* Product Detail Quick View modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
        />
      )}

      {/* Account Login and Registration Modal */}
      {isAuthModalOpen && (
        <AuthModal
          onAuthSuccess={handleAuthSuccess}
          onClose={() => setIsAuthModalOpen(false)}
        />
      )}

      {/* Global Humble Professional Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-10 mt-16 font-medium text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
          
          {/* Col 1 */}
          <div className="space-y-4">
            <div className="font-display text-sm font-bold text-white flex items-center gap-1.5">
              <ShoppingBag className="h-4.5 w-4.5 text-indigo-500" /> AeroStore
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs">
              Meticulously designed web client-server application demonstrating persistent database transactional structures, custom role security pipelines, and visual tracking timelines.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <div className="text-white font-semibold uppercase tracking-wider text-[10px]">Technical Sandbox details</div>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">●</span>
                <span>Active JSON Container Persistence</span>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">●</span>
                <span>Sub-collection Order Architecture</span>
              </div>
              <div className="flex gap-2">
                <span className="text-indigo-400 font-bold">●</span>
                <span>Google AI Studio Full-Stack Node Runtime</span>
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <div className="text-white font-semibold uppercase tracking-wider text-[10px]">Secure Authentication Models</div>
            <div className="space-y-1 text-slate-400 text-[11px]">
              <div>Logged as Customer: <span className="text-slate-300">customer@store.com</span></div>
              <div>Logged as Administrator: <span className="text-slate-300">admin@store.com</span></div>
              <p className="text-[10px] text-indigo-400 font-semibold mt-2">
                Pre-configured profiles allow instant sandbox validation.
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <div className="text-[11px] text-slate-500">
            © 2026 AeroStore E-Commerce Services. All rights reserved. Built with Vite & React.
          </div>
          <div className="flex gap-4 text-[11px] text-slate-400">
            <span className="hover:text-white cursor-pointer">Security Protocol</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Transactional Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
