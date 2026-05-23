import React, { useState } from "react";
import { Order, OrderStatus } from "../types";
import { Calendar, Package, MapPin, DollarSign, RefreshCw, Layers, CheckCircle2, ShoppingBag, ClipboardList, Printer, QrCode, FileText, X } from "lucide-react";

interface OrderHistoryViewProps {
  orders: Order[];
  onRefresh: () => void;
  userRole: "admin" | "user";
}

export default function OrderHistoryView({ orders, onRefresh, userRole }: OrderHistoryViewProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isInvoiceSlipOpen, setIsInvoiceSlipOpen] = useState(false);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "processing":
        return "bg-blue-50 text-blue-600 border-blue-200";
      case "shipped":
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "delivered":
        return "bg-emerald-50 text-emerald-600 border-emerald-200";
      case "cancelled":
        return "bg-rose-50 text-rose-600 border-rose-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getTimelineStepIndex = (status: OrderStatus): number => {
    const steps: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];
    return steps.indexOf(status);
  };

  const timelineSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: "pending", label: "Pending Verification", desc: "Order details logged, verifying credentials" },
    { key: "processing", label: "Aero Processing", desc: "Peripherals cleared from shelves, transit wrapped" },
    { key: "shipped", label: "In-Transit Cargo", desc: "Transport tracking reference active on global route" },
    { key: "delivered", label: "Safely Handover", desc: "Delivered status recorded at mailbox coordinates" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            {userRole === "admin" ? "All Global Store Orders" : "Your Ordered Invoices"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {userRole === "admin"
              ? "Oversee user transactions, review inventory sales, and process logistics"
              : "Track delivery status, view items in receipts, and check addresses"}
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all shadow-xs self-start"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          <span>Sync Statuses</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Side: Order Invoices List */}
        <div className="lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center bg-slate-50/25">
              <ShoppingBag className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">No orders logged</h3>
              <p className="text-xs text-slate-400 mt-1">
                {userRole === "admin"
                  ? "Customers haven't purchased any store products yet."
                  : "You haven't placed any order listings yet."}
              </p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
                className={`cursor-pointer rounded-xl border p-4 text-left transition-all ${
                  selectedOrderId === order.id
                    ? "border-slate-900 bg-white ring-2 ring-indigo-500/80 shadow-md"
                    : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-50 pb-2.5 mb-3">
                  <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                    ID: {order.id.slice(0, 10).toUpperCase()}...
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end">
                    <DollarSign className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span className="font-bold text-slate-900 font-display">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 text-slate-500 font-semibold text-[11px] line-clamp-1">
                  {order.items.reduce((acc, current) => acc + current.quantity, 0)} Items:{" "}
                  <span className="font-normal font-sans italic text-slate-400">
                    {order.items.map((i) => i.productName).join(", ")}
                  </span>
                </div>

                {userRole === "admin" && (
                  <div className="mt-2 pl-2 border-l-2 border-indigo-400 text-[10px] text-slate-400 font-semibold">
                    Customer: {order.userEmail}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right Side: Visual Progress Timeline & Invoice Breakdowns */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-6">
              
              {/* Header Details with Receipt launcher */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-4">
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-800">
                    Billing Details: {selectedOrder.id.toUpperCase()}
                  </h3>
                  <div className="text-[11px] text-slate-400 font-medium">
                    Placed on: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </div>
                </div>
                
                <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
                  <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 border rounded-lg shrink-0 ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  
                  <button
                    onClick={() => setIsInvoiceSlipOpen(true)}
                    className="cursor-pointer rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 shadow-xs shrink-0"
                    id={`btn-invoice-${selectedOrder.id}`}
                  >
                    <FileText className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Invoice Statement</span>
                  </button>
                </div>
              </div>

              {/* Delivery Timeline Tracker */}
              {selectedOrder.status !== "cancelled" ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Dispatched Status Tracking
                    </h4>
                    {selectedOrder.status === "shipped" && (
                      <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.5 font-bold">
                        Transit ID: AC-{selectedOrder.id.slice(0, 6).toUpperCase()}88M
                      </span>
                    )}
                  </div>
                  <div className="relative pl-6 space-y-5">
                    {/* Visual Vertical line */}
                    <div className="absolute top-2 bottom-2 left-2.5 w-0.5 bg-slate-100" />

                    {timelineSteps.map((step, idx) => {
                      const currentActiveIndex = getTimelineStepIndex(selectedOrder.status);
                      const isCompleted = idx <= currentActiveIndex;
                      const isCurrent = idx === currentActiveIndex;

                      return (
                        <div key={step.key} className="relative flex gap-4 text-left">
                          {/* Circle dot indicators */}
                          <div
                            className={`absolute -left-5 flex h-4.5 w-4.5 items-center justify-center rounded-full border-2 transition-all ${
                              isCompleted
                                ? isCurrent
                                  ? "bg-white border-indigo-600 scale-110 ring-4 ring-indigo-50"
                                  : "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                : "bg-white border-slate-200"
                            }`}
                          >
                            {isCompleted && !isCurrent && (
                              <CheckCircle2 className="h-3 w-3 text-white fill-indigo-600" />
                            )}
                            {isCurrent && (
                              <div className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-ping" />
                            )}
                          </div>

                          <div className="pl-2">
                            <span className={`block text-xs font-semibold ${isCompleted ? "text-slate-800" : "text-slate-400"}`}>
                              {step.label} {isCurrent && <span className="text-[9px] font-bold text-indigo-600 ml-1 rounded-sm bg-indigo-50 px-1 border border-indigo-100/50 uppercase">Active</span>}
                            </span>
                            <span className="block text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                              {step.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3 text-rose-700">
                  <MapPin className="h-5 w-5 shrink-0 text-rose-500" />
                  <div>
                    <h5 className="text-xs font-bold">Order Cancelled</h5>
                    <p className="text-[11px] leading-relaxed mt-0.5">
                      This order invoice was cancelled by the shop administrators. Inventory is released and restocked to catalog.
                    </p>
                  </div>
                </div>
              )}

              {/* Box Items Checklist */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3.5">
                  Ordered Accessories Summary
                </h4>
                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.productId} className="flex p-3 justify-between items-center bg-slate-50/20 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-slate-100 border">
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-800">{item.productName}</div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            Unit Price: ${item.price.toFixed(2)} × {item.quantity}
                          </div>
                        </div>
                      </div>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Destination details */}
              <div className="border-t border-slate-100 pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs text-slate-600">
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Delivery Coordinates
                  </h4>
                  <div className="space-y-0.5 leading-relaxed font-medium">
                    <div className="font-bold text-slate-800">{selectedOrder.shippingAddress.fullName}</div>
                    <div>{selectedOrder.shippingAddress.addressLine1}</div>
                    <div>
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}, {selectedOrder.shippingAddress.postalCode}
                    </div>
                    <div>{selectedOrder.shippingAddress.country}</div>
                    <div className="text-[10px] text-slate-400 pt-1">Phone Contact: {selectedOrder.shippingAddress.phone}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Payment Struct
                  </h4>
                  <div className="font-semibold text-slate-800 capitalize bg-slate-50 border px-3 py-1.5 rounded-lg inline-block text-[11px]">
                    {selectedOrder.paymentMethod.replace("_", " ")}
                  </div>
                  <div className="text-sm font-semibold text-slate-500 mt-5">
                    Grand Total Paid: <strong className="text-indigo-600 font-bold text-base font-mono block sm:inline mt-1 sm:mt-0 ml-0 sm:ml-1">${selectedOrder.totalAmount.toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-450 shadow-xs">
              <ClipboardList className="h-10 w-10 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">Select an invoice from the left panel to display tracking state.</p>
            </div>
          )}
        </div>
      </div>

      {/* Retro-Monochrome Print Invoice Slip Overlay Panel */}
      {isInvoiceSlipOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border border-slate-300 rounded-none shadow-2xl p-8 relative animate-in fade-in zoom-in-95 duration-230 font-mono text-left text-xs text-slate-800">
            {/* Close trigger */}
            <button
              onClick={() => setIsInvoiceSlipOpen(false)}
              className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500"
              id="btn-close-invoice"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Simulated Receipt top decoration */}
            <div className="border-t-4 border-slate-900 pt-4 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-base font-bold text-slate-950 uppercase tracking-widest">AeroStore Labs</h1>
                  <p className="text-[10px] text-slate-500 mt-0.5">Workspace Peripherals & Gear</p>
                </div>
                <div className="text-right">
                  <span className="inline-block bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5">Receipt Statement</span>
                  <p className="text-[10px] text-slate-500 mt-1">Invoice Key: {selectedOrder.id.slice(0, 15).toUpperCase()}</p>
                </div>
              </div>
            </div>

            {/* Merchant / Billing Rows */}
            <div className="grid grid-cols-2 gap-6 border-b border-double border-slate-300 pb-5 mb-5 text-[11px]">
              <div>
                <p className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">Fulfillment Center</p>
                <p className="mt-1.5">AeroStore Distribution Labs</p>
                <p>901 Logistics Way, Lane 40</p>
                <p>San Francisco, CA 94107</p>
                <p className="text-slate-400">logistics@aerostore.com</p>
              </div>
              <div>
                <p className="font-bold text-slate-900 border-b border-slate-200 pb-1 uppercase tracking-wide">Billed Recipient</p>
                <p className="mt-1.5 font-bold">{selectedOrder.shippingAddress.fullName}</p>
                <p>{selectedOrder.shippingAddress.addressLine1}</p>
                <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.postalCode}</p>
                <p className="text-slate-400">{selectedOrder.userEmail}</p>
              </div>
            </div>

            {/* Statement metadata */}
            <div className="grid grid-cols-3 gap-3 border-b border-dashed border-slate-200 pb-4 mb-5 text-[10px]">
              <div>
                <span className="block text-slate-400 uppercase">Issue Date</span>
                <span className="font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="block text-slate-400 uppercase">Routing Method</span>
                <span className="font-semibold capitalize">{selectedOrder.paymentMethod.replace("_", " ")}</span>
              </div>
              <div>
                <span className="block text-slate-400 uppercase">Shipment status</span>
                <span className="font-semibold uppercase text-indigo-600">{selectedOrder.status}</span>
              </div>
            </div>

            {/* Products Table details */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-12 font-bold text-slate-900 border-b border-slate-900 pb-1 uppercase text-[10px]">
                <div className="col-span-6">Item Specification</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Rate</div>
                <div className="col-span-2 text-right">Sum</div>
              </div>

              {selectedOrder.items.map((it, iidx) => (
                <div key={iidx} className="grid grid-cols-12 text-[11px] items-center py-1 border-b border-slate-100">
                  <div className="col-span-6 truncate font-sans font-medium text-slate-900">{it.productName}</div>
                  <div className="col-span-2 text-center font-mono">{it.quantity}</div>
                  <div className="col-span-2 text-right font-mono">${it.price.toFixed(2)}</div>
                  <div className="col-span-2 text-right font-mono">${(it.price * it.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Totals computation */}
            <div className="border-t border-slate-300 pt-3 flex flex-col items-end spacing-y-1.5 text-[11px]">
              <div className="w-56 space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Item values:</span>
                  <span className="font-mono">${(selectedOrder.totalAmount / 1.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Est Tax Rate (8%):</span>
                  <span className="font-mono">${(selectedOrder.totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Standard Parcels:</span>
                  <span className="font-mono text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-2 font-bold text-slate-950 text-xs text-indigo-605">
                  <span className="uppercase">Grand Paid subtotal:</span>
                  <span className="font-mono">${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Bottom QR Reference & stamp */}
            <div className="border-t border-dashed border-slate-300 pt-6 mt-6 flex justify-between items-center bg-slate-50 p-4 rounded-none">
              <div className="max-w-[300px]">
                <p className="text-[10px] font-bold text-slate-950 uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Authorized Statement
                </p>
                <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                  Logistics records indicate stock depletion checks passed. Thank you for validating AeroStore core hardware components securely.
                </p>
                <button
                  onClick={() => alert("Invoice slip routed to default print spooler system successfully.")}
                  className="mt-3 cursor-pointer rounded bg-slate-900 text-white hover:bg-slate-800 px-3 py-1 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <Printer className="h-3 w-3" /> Print Invoice
                </button>
              </div>

              {/* Decorative Raw SVG QR Code block */}
              <div className="shrink-0 flex flex-col items-center">
                <div className="h-16 w-16 border bg-white p-1 flex items-center justify-center">
                  <QrCode className="h-14 w-14 text-slate-900" />
                </div>
                <span className="text-[8px] text-slate-400 mt-1 uppercase font-semibold">Verify SKU Slip</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
