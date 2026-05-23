import React, { useState } from "react";
import { Product, Order, OrderStatus } from "../types";
import { Plus, Edit2, Trash2, ShieldCheck, DollarSign, ShoppingCart, Layers, AlertTriangle, KeyRound, CheckCheck, X } from "lucide-react";

interface AdminDashboardViewProps {
  products: Product[];
  orders: Order[];
  onCreateProduct: (product: Omit<Product, "id">) => Promise<any>;
  onUpdateProduct: (id: string, product: Partial<Product>) => Promise<any>;
  onDeleteProduct: (id: string) => Promise<any>;
  onUpdateOrderStatus: (id: string, status: OrderStatus) => Promise<any>;
  onRefresh: () => void;
}

export default function AdminDashboardView({
  products,
  orders,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  onRefresh,
}: AdminDashboardViewProps) {
  const [activeTab, setActiveTab] = useState<"products" | "orders" | "analytics">("products");

  // Form States for Add / Edit Product Modal
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Audio");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");
  const [featured, setFeatured] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate Statistics
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const totalSalesCount = orders.filter((o) => o.status !== "cancelled").length;
  const avgOrderValue = totalSalesCount > 0 ? totalRevenue / totalSalesCount : 0;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory("Audio");
    setImageUrl("");
    setStock("");
    setFeatured(false);
    setError(null);
    setIsOpenModal(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price.toString());
    setCategory(p.category);
    setImageUrl(p.imageUrl);
    setStock(p.stock.toString());
    setFeatured(!!p.featured);
    setError(null);
    setIsOpenModal(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !category || !imageUrl || !stock) {
      setError("Please fill out all required product fields.");
      return;
    }

    setLoading(true);
    setError(null);

    const productPayload = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category: category.trim(),
      imageUrl: imageUrl.trim(),
      stock: Number(stock),
      featured,
    };

    try {
      if (editingProduct) {
        await onUpdateProduct(editingProduct.id, productPayload);
      } else {
        await onCreateProduct(productPayload);
      }
      setIsOpenModal(false);
      onRefresh();
    } catch (err: any) {
      setError(err.message || "Failed to save product.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async (productId: string) => {
    if (confirm("Are you absolutely sure you want to remove this product from the inventory?")) {
      try {
        await onDeleteProduct(productId);
        onRefresh();
      } catch (err: any) {
        alert(err.message || "Failed to delete product.");
      }
    }
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    try {
      await onUpdateOrderStatus(orderId, status);
      onRefresh();
    } catch (err: any) {
      alert(err.message || "Failed to update order status.");
    }
  };

  // Pre-configured suggestions for product images to help developers
  const presetImages = [
    { label: "Audio Headphone", url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600" },
    { label: "Keyboards", url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600" },
    { label: "Office Supplies", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=600" },
    { label: "Lamps & Lampshades", url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=600" },
    { label: "Travel Packs / Bags", url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600" }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Admin Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
            <span>Store Command Center</span>
          </div>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Store Management Console
          </h2>
        </div>
        <div className="flex gap-2">
          {activeTab === "products" && (
            <button
              onClick={handleOpenAddModal}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-slate-950 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Register Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Analytics Statistics Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Gross Revenue</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-lg sm:text-2xl font-semibold text-slate-900">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Sales</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-lg sm:text-2xl font-semibold text-slate-900">
            {totalSalesCount}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg. Order Value</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-lg sm:text-2xl font-semibold text-slate-900">
            ${avgOrderValue.toFixed(2)}
          </p>
        </div>

        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Out of Stock</span>
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${outOfStockCount > 0 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-400"}`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-lg sm:text-2xl font-semibold text-slate-900">
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* Admin Tab Selectors */}
      <div className="flex border-b border-slate-100 mb-6 font-medium gap-1">
        <button
          onClick={() => setActiveTab("products")}
          className={`cursor-pointer px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "products"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          Manage Inventory ({products.length})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`cursor-pointer px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "orders"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          Customer Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`cursor-pointer px-4 py-2.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "analytics"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-400 hover:text-slate-700"
          }`}
        >
          Revenue Analytics
        </button>
      </div>

      {/* TAB CONTENTS */}

      {/* Tab 1: Products table list */}
      {activeTab === "products" && (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4">Item Details</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Available Stock</th>
                  <th className="px-6 py-4">Featured</th>
                  <th className="px-6 py-4 text-right">Settings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                      Store inventory is empty. Complete registering standard e-commerce details.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/40">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-50 border">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 line-clamp-1">{p.name}</div>
                            <div className="font-mono text-[10px] text-slate-400 font-bold uppercase">ID: {p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-semibold">{p.category}</td>
                      <td className="px-6 py-4 text-slate-800 font-mono font-bold">${p.price.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-sm font-bold text-[10px] ${
                          p.stock === 0
                            ? "bg-rose-50 text-rose-600"
                            : p.stock <= 5
                            ? "bg-amber-50 text-amber-600"
                            : "bg-indigo-50/50 text-indigo-700"
                        }`}>
                          {p.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {p.featured ? (
                          <span className="inline-flex h-2 w-2 rounded-full bg-indigo-600" />
                        ) : (
                          <span className="inline-flex h-2 w-2 rounded-full bg-slate-200" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 text-slate-400">
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-1 cursor-pointer hover:text-indigo-600 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(p.id)}
                            className="p-1 cursor-pointer hover:text-rose-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders table update operations */}
      {activeTab === "orders" && (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  <th className="px-6 py-4">Receipt Details</th>
                  <th className="px-6 py-4">Account Buyer</th>
                  <th className="px-6 py-4">Total Price</th>
                  <th className="px-6 py-4">Items Count</th>
                  <th className="px-6 py-4">Current Logistics Stage</th>
                  <th className="px-6 py-4 text-right">Update Order Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 text-xs">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium font-sans">
                      No client order transactions have been placed yet.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/40">
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-slate-800 uppercase">{order.id}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">{order.userName}</div>
                        <div className="text-[10px] text-slate-400">{order.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-mono font-bold">${order.totalAmount.toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold text-slate-500">
                        {order.items.reduce((acc, i) => acc + i.quantity, 0)} items
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider border ${
                          order.status === "delivered"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-25"
                            : order.status === "cancelled"
                            ? "bg-rose-50 text-rose-600 border-rose-25"
                            : "bg-amber-50 text-amber-600 border-amber-25"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                          className="rounded-lg border border-slate-205 bg-white text-xs px-2.5 py-1 outline-hidden cursor-pointer focus:border-indigo-500 font-medium"
                        >
                          <option value="pending">Pending Review</option>
                          <option value="processing">Processing Pack</option>
                          <option value="shipped">Shipped Transit</option>
                          <option value="delivered">Delivered recipient</option>
                          <option value="cancelled">Cancelled Reject</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Interactive SVG Analytics charts */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chart 1: Sales trends */}
          <div className="bg-white border rounded-2xl p-6 text-left shadow-xs">
            <h3 className="font-display text-sm font-semibold text-slate-800 mb-1">
              Store Daily Transaction Value
            </h3>
            <p className="text-[11px] text-slate-400 mb-6">Historical client expenditure tracking</p>

            <div className="relative h-64 w-full">
              {/* Simple illustrative high-performance SVG line trend graph */}
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {/* Grid guidelines */}
                <line x1="0" y1="20%" x2="100%" y2="20%" stroke="#e2e8f0" strokeDasharray="4 4" />
                <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#e2e8f0" strokeDasharray="4 4" />
                <line x1="0" y1="80%" x2="100%" y2="80%" stroke="#e2e8f0" strokeDasharray="4 4" />

                {/* Core Curve Area */}
                <path
                  d="M0 240 Q 60 120, 120 180 T 240 80 T 360 140 T 480 30 T 600 110"
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                <path
                  d="M0 240 Q 60 120, 120 180 T 240 80 T 360 140 T 480 30 T 600 110 L 600 250 L 0 250 Z"
                  fill="url(#chartGrad)"
                />

                {/* Markers */}
                <circle cx="240" cy="80" r="5" fill="#4f46e5" stroke="white" strokeWidth="2" />
                <circle cx="480" cy="30" r="5" fill="#4f46e5" stroke="white" strokeWidth="2" />

                {/* Tooltip mockup */}
                <g transform="translate(430, -10)">
                  <rect width="90" height="30" rx="6" fill="#0f172a" />
                  <text x="45" y="18" fill="white" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Peak: +$1,240
                  </text>
                </g>
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-4">
              <span>May 18</span>
              <span>May 19</span>
              <span>May 20</span>
              <span>May 21</span>
              <span>May 22</span>
              <span>May 23 (Today)</span>
            </div>
          </div>

          {/* Chart 2: Category sales */}
          <div className="bg-white border rounded-2xl p-6 text-left shadow-xs">
            <h3 className="font-display text-sm font-semibold text-slate-800 mb-1">
              Category Sales Volume Distribution
            </h3>
            <p className="text-[11px] text-slate-400 mb-6">Aggregate categories sold to clients</p>

            <div className="relative h-64 flex flex-col justify-between">
              {["Audio", "Kitchen", "Office", "Travel", "Accessories"].map((cat) => {
                // Calculate category total
                const catTotal = orders
                  .filter((o) => o.status !== "cancelled")
                  .flatMap((o) => o.items)
                  .filter((item) => {
                    const matchedProd = products.find((p) => p.id === item.productId);
                    return matchedProd?.category === cat;
                  })
                  .reduce((acc, current) => acc + current.quantity, 0);

                const mockMax = Math.max(catTotal, 5); // Fallback scale for seed items
                const pct = Math.min((catTotal / mockMax) * 100, 100);

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat}</span>
                      <span className="font-mono text-slate-500 font-normal">{catTotal} Sold</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ACTION REGISTER/EDIT PRODUCT MODAL OVERLAY */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4.5 w-4.5 text-indigo-400" />
                <h3 className="font-display text-sm font-bold tracking-tight">
                  {editingProduct ? "Modify Product Credentials" : "Register New Store Product"}
                </h3>
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4 text-left">
              {error && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mechanical Keyboard"
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Product Category
                  </label>
                  <select
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 cursor-pointer"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Audio">Audio</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Office">Office</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Travel">Travel</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Detailed Description
                </label>
                <textarea
                  required
                  placeholder="Detailed layout of electronic key attributes, battery standards, aesthetics, etc."
                  rows={3}
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Retail Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Warehouse Stocks Count
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Image Asset Link (URL)
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                
                {/* Preset suggestions helper to make design easy */}
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] font-bold text-slate-400 self-center uppercase">Seed Stocks: </span>
                  {presetImages.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setImageUrl(p.url)}
                      className="cursor-pointer text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border rounded-sm font-semibold text-slate-600 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Featured toggle */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 uppercase tracking-wide cursor-pointer py-1">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="text-indigo-600 focus:ring-indigo-500 h-4 w-4 rounded-md border-slate-300"
                />
                Is Featured Catalog Item (Sits highlighted in top listings)
              </label>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                <button
                  type="button"
                  onClick={() => setIsOpenModal(false)}
                  className="cursor-pointer font-semibold text-xs text-slate-400 hover:text-slate-600 px-3 py-2 uppercase tracking-wide"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition-all shadow-md disabled:opacity-40"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>{loading ? "Saving Records..." : editingProduct ? "Confirm Re-Write" : "Commit Item"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
