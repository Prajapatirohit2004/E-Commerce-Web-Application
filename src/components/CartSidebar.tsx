import React from "react";
import { CartItem } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export default function CartSidebar({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartSidebarProps) {
  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const estimateTax = subtotal * 0.08; // 8% sales tax
  const estimateShipping = subtotal > 150 ? 0 : 15; // Free shipping above $150
  const orderTotal = subtotal + estimateTax + estimateShipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Mask */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Drawer Sheet Stage */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-slate-100 bg-white shadow-2xl"
          >
            {/* Header Area */}
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-6">
              <div className="flex items-center gap-2 text-slate-800">
                <ShoppingBag className="h-5 w-5 text-indigo-600" />
                <h2 className="font-display text-base font-bold tracking-tight">
                  Shopping Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})
                </h2>
              </div>
              <button
                onClick={onClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-700">Your cart is empty</h3>
                  <p className="mt-1 text-xs text-slate-400 max-w-xs leading-relaxed">
                    Browse the catalog and add premium technical items to begin your e-commerce journey.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-4 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-900 transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-4 p-3 rounded-xl border border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Item Image */}
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Item Info & Quantity Controls */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => onRemoveItem(item.product.id)}
                            className="cursor-pointer text-slate-400 hover:text-rose-600 p-0.5"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wild shrink-0">
                          {item.product.category}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        {/* Quantity controls */}
                        <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 px-2 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer text-xs"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-semibold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 px-2 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer text-xs"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Calculated pricing */}
                        <span className="font-display font-bold text-xs text-slate-800">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Static Totals Card Foot block */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-3">
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Sales Tax (8%)</span>
                  <span>${estimateTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 font-medium">
                  <span>Shipping Estimation</span>
                  <span>{estimateShipping === 0 ? "FREE" : `$${estimateShipping.toFixed(2)}`}</span>
                </div>

                <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-bold text-slate-900 font-display">
                  <span>Estimate Total</span>
                  <span>${orderTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={onCheckout}
                  className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold tracking-wide text-white shadow-xl hover:bg-slate-800 transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
