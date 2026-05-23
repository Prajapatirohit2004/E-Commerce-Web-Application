import React, { useState } from "react";
import { CartItem, User } from "../types";
import { CreditCard, Truck, ArrowLeft, ClipboardList, ShieldCheck, Ticket, Check, AlertCircle } from "lucide-react";

interface CheckoutViewProps {
  user: User;
  cartItems: CartItem[];
  onBackToCart: () => void;
  onOrderCompleted: () => void;
  onPlaceOrder: (shippingAddress: any, paymentMethod: string, finalTotal?: number) => Promise<any>;
}

export default function CheckoutView({
  user,
  cartItems,
  onBackToCart,
  onOrderCompleted,
  onPlaceOrder,
}: CheckoutViewProps) {
  // Address parameters
  const [fullName, setFullName] = useState(user.name || "");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United States");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");

  // Coupon promo code engine
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Math totals calculation
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (appliedPromo === "AERO20") {
    discountAmount = subtotal * 0.20;
  } else if (appliedPromo === "FOCUS30") {
    discountAmount = subtotal * 0.30;
  }

  const itemsCostAfterDiscount = subtotal - discountAmount;
  const estimateTax = itemsCostAfterDiscount * 0.08;
  const isFreeShippingPromo = appliedPromo === "FREESHIP";
  const estimateShipping = (subtotal > 150 || isFreeShippingPromo) ? 0 : 15;
  const orderTotal = Math.max(0, itemsCostAfterDiscount + estimateTax + estimateShipping);

  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = promoInput.trim().toUpperCase();
    if (!token) return;

    if (token === "AERO20" || token === "FOCUS30" || token === "FREESHIP") {
      setAppliedPromo(token);
      setPromoError(null);
      setPromoInput("");
    } else {
      setPromoError("This promo token is invalid or expired.");
      setTimeout(() => {
        setPromoError(null);
      }, 3500);
    }
  };

  const handleQuickApply = (code: string) => {
    setAppliedPromo(code);
    setPromoError(null);
    setPromoInput("");
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !addressLine1 || !city || !state || !postalCode || !phone) {
      setError("Please complete all shipping address fields.");
      return;
    }

    setLoading(true);
    setError(null);

    const address = {
      fullName,
      addressLine1,
      city,
      state,
      postalCode,
      country,
      phone,
    };

    try {
      await onPlaceOrder(address, paymentMethod, orderTotal);
      onOrderCompleted();
    } catch (err: any) {
      setError(err.message || "Failed to submit checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 text-left">
      {/* Header return */}
      <button
        onClick={onBackToCart}
        className="group mb-8 flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        <span>Return to Store Catalog</span>
      </button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Side: Shipping Address & Details Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-4 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Truck className="h-4.5 w-4.5" />
            </div>
            <h2 className="font-display text-base font-bold tracking-tight text-slate-800">
              Shipping & Delivery Address
            </h2>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Full recipient name"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 555-0199"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Street Address
              </label>
              <input
                type="text"
                required
                placeholder="123 Flight Lane, Suite 4B"
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  City
                </label>
                <input
                  type="text"
                  required
                  placeholder="San Francisco"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  State / Region
                </label>
                <input
                  type="text"
                  required
                  placeholder="California"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Postal Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="94103"
                  className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Country
              </label>
              <select
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 shadow-xs outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="United States">United States</option>
                <option value="Canada">Canada</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Japan">Japan</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="India">India</option>
              </select>
            </div>

            {/* Payment Method Select panel */}
            <div className="pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 pb-4 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <CreditCard className="h-4.5 w-4.5" />
                </div>
                <h2 className="font-display text-base font-bold tracking-tight text-slate-800">
                  Payment Method
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  paymentMethod === "credit_card"
                    ? "border-slate-900 bg-slate-50 font-bold"
                    : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "credit_card"}
                      onChange={() => setPaymentMethod("credit_card")}
                      className="text-indigo-600 focus:ring-indigo-505"
                    />
                    <div>
                      <span className="block text-xs font-semibold text-slate-800">Credit / Debit Card</span>
                      <span className="block text-[10px] text-slate-400">Visa, Mastercard, Amex</span>
                    </div>
                  </div>
                  <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                </label>

                <label className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition-all ${
                  paymentMethod === "sandbox"
                    ? "border-slate-900 bg-slate-50 font-bold"
                    : "border-slate-200 hover:bg-slate-50"
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === "sandbox"}
                      onChange={() => setPaymentMethod("sandbox")}
                      className="text-indigo-600 focus:ring-indigo-505"
                    />
                    <div>
                      <span className="block text-xs font-semibold text-slate-800">Store Credit / Sandbox</span>
                      <span className="block text-[10px] text-slate-400">Instant approval sandbox mode</span>
                    </div>
                  </div>
                  <div className="h-5 w-5 bg-emerald-50 text-emerald-600 items-center justify-center flex rounded-full text-[10px] font-bold">
                    $
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="mt-6 flex w-full cursor-pointer items-center justify-center rounded-xl bg-indigo-600 py-3 text-center text-sm font-semibold tracking-wide text-white shadow-xl hover:bg-slate-900 transition-all disabled:opacity-40"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Place Store Order Securely"
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Order Summarized details Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-4">
              <ClipboardList className="h-5 w-5 text-indigo-400" />
              <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-200">
                Order Invoice Summary
              </h3>
            </div>

            {/* List products in order */}
            <div className="max-h-56 overflow-y-auto space-y-3.5 pr-2 mb-6 border-b border-slate-800 pb-4">
              {cartItems.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-10 w-10 overflow-hidden rounded bg-slate-800 border border-slate-700">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-xs">
                      <span className="font-medium text-slate-100 line-clamp-1">{item.product.name}</span>
                      <span className="text-[10px] text-slate-400">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-indigo-300">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Interactive Coupon Engine Component */}
            <div className="mb-6 space-y-2 border-b border-slate-800 pb-5">
              <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-430 text-indigo-400">
                <Ticket className="h-4.5 w-4.5 shrink-0" />
                <span>Promotional Voucher Codes</span>
              </div>

              {!appliedPromo ? (
                <form onSubmit={handleApplyPromo} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter Code (e.g. FOCUS30)"
                    className="flex-grow rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-400 uppercase font-mono"
                  />
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white transition-colors"
                  >
                    Apply
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between rounded-lg bg-indigo-950/40 border border-indigo-900/50 p-2.5 text-xs mt-2 animate-in fade-in zoom-in-95 duration-230">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <div>
                      <span className="font-bold text-emerald-400 font-mono">{appliedPromo}</span>
                      <span className="block text-[10px] text-slate-400">
                        {appliedPromo === "AERO20" && "20% Discount Activated"}
                        {appliedPromo === "FOCUS30" && "30% Discount Activated"}
                        {appliedPromo === "FREESHIP" && "Free Shipping Activated"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="cursor-pointer text-[10px] font-bold uppercase text-rose-400 hover:text-rose-300 hover:underline px-2 py-0.5"
                  >
                    Remove
                  </button>
                </div>
              )}

              {promoError && (
                <div className="flex items-center gap-1.5 text-[10px] text-rose-400 font-medium pt-1.5 animate-pulse">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{promoError}</span>
                </div>
              )}

              {/* Quick Choice Pills Box */}
              {!appliedPromo && (
                <div className="pt-2">
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Available Active Sandboxes:</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickApply("FOCUS30")}
                      className="cursor-pointer rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-0.5 text-[9px] font-mono border border-slate-700 font-bold"
                    >
                      FOCUS30 (-30%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickApply("AERO20")}
                      className="cursor-pointer rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-0.5 text-[9px] font-mono border border-slate-700 font-bold"
                    >
                      AERO20 (-20%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickApply("FREESHIP")}
                      className="cursor-pointer rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-0.5 text-[9px] font-mono border border-slate-700 font-bold"
                    >
                      FREESHIP
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Totals Block */}
            <div className="space-y-2.5 border-t border-slate-800 pt-4 mt-4 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Total Items Cost</span>
                <span className="font-mono">${subtotal.toFixed(2)}</span>
              </div>
              
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Coupon Deduction ({appliedPromo})</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>System Tax Rate (8%)</span>
                <span className="font-mono">${estimateTax.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Shipping Fees</span>
                <span className="font-mono">
                  {estimateShipping === 0 ? (
                    <span className="text-indigo-400 font-bold">FREE</span>
                  ) : (
                    `$${estimateShipping.toFixed(2)}`
                  )}
                </span>
              </div>
              
              <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-bold text-white font-display">
                <span>Grand Order Total</span>
                <span className="font-mono text-indigo-400 font-bold text-sm">${orderTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Secure details card */}
          <div className="rounded-xl border border-slate-100 bg-white p-4 flex gap-3 text-slate-500">
            <ShieldCheck className="h-7 w-7 text-emerald-500 shrink-0" />
            <div>
              <h4 className="text-xs font-semibold text-slate-800 font-display">Order Security Guard</h4>
              <p className="text-[11px] leading-relaxed mt-0.5">
                All order operations run transactional stock deductions and inventory locks server-side, preventing duplicate carts or stock starvation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
