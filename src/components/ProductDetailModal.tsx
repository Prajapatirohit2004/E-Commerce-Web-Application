import React, { useState } from "react";
import { Product } from "../types";
import { X, Plus, Minus, ShoppingCart, ShieldAlert, Sparkles, Truck, Star, MessageSquare, Sliders, Check } from "lucide-react";
import { getProductSpecs, getProductRating, addProductReview } from "../utils/productDetails";

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock === 0;

  // Tabs state
  const [activeTab, setActiveTab] = useState<"specs" | "reviews" | "shipping">("specs");

  // Review submission state
  const [newReviewName, setNewReviewName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  // Dynamic reviews calculation state
  const [ratingInfo, setRatingInfo] = useState(() => getProductRating(product.id));

  // Specs retrieved matching product model details
  const specs = getProductSpecs(product.category, product.name);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddClick = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    const author = newReviewName.trim() || "Verified Buyer";
    addProductReview(product.id, author, newReviewRating, newReviewComment);

    const updated = getProductRating(product.id);
    setRatingInfo(updated);
    
    setReviewFeedback("Thank you! Review saved successfully.");
    setNewReviewName("");
    setNewReviewRating(5);
    setNewReviewComment("");

    // Trigger local state updates to notify any rating changes upstream
    // (Note: custom reviews refresh smoothly on re-opening)
    setTimeout(() => {
      setReviewFeedback(null);
    }, 3500);
  };

  // Review Distribution math
  const totalReviewsCount = ratingInfo.reviews.length;
  const ratingCounts = [0, 0, 0, 0, 0]; // 1★, 2★, 3★, 4★, 5★
  ratingInfo.reviews.forEach((r) => {
    const starIdx = Math.max(1, Math.min(5, r.rating)) - 1;
    ratingCounts[starIdx]++;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-230 max-h-[92vh] flex flex-col">
        
        {/* Scroller Frame for long modal contents */}
        <div className="overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-100">
            
            {/* Left Panel Image Spot */}
            <div className="relative aspect-square md:aspect-auto md:h-full bg-slate-50 min-h-[300px] flex items-center justify-center">
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
                {product.featured && (
                  <span className="flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
                    <Sparkles className="h-2.5 w-2.5 fill-white" /> Featured Choice
                  </span>
                )}
                {isOutOfStock ? (
                  <span className="rounded-md bg-slate-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
                    Sold Out
                  </span>
                ) : (
                  <span className="rounded-md bg-emerald-500 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
                    In Stock ({product.stock})
                  </span>
                )}
              </div>
              
              <img
                src={product.imageUrl}
                alt={product.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover max-h-[380px] md:max-h-full"
              />
            </div>

            {/* Right Details Description Column */}
            <div className="p-6 flex flex-col justify-between text-left relative min-h-[340px]">
              {/* Close trigger */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                id="btn-close-detail"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Core textual info */}
              <div className="space-y-4 pr-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">
                    Category: {product.category}
                  </span>
                  <h3 className="font-display text-lg font-bold text-slate-900 mt-1 mr-6 leading-snug">
                    {product.name}
                  </h3>
                </div>

                {/* Stars and Score Summary */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.round(ratingInfo.average)
                            ? "fill-amber-500 text-amber-500"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-800">
                    {ratingInfo.average.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{ratingInfo.count} verified reviews</span>
                </div>

                <div className="font-display font-semibold text-xl text-slate-800">
                  ${product.price.toFixed(2)}
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {product.description}
                </p>

                {/* Secure guarantee */}
                <div className="flex gap-2 p-2.5 border border-indigo-50 bg-indigo-50/20 text-[10px] text-slate-505 rounded-lg">
                  <Truck className="h-4 w-4 text-indigo-500 shrink-0 self-center" />
                  <span className="text-slate-600">Standard global parcel shipment processing runs with full transit tracking.</span>
                </div>
              </div>

              {/* Cart manipulation elements */}
              <div className="border-t border-slate-100 pt-5 mt-6 space-y-4">
                {!isOutOfStock ? (
                  <>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-600 uppercase tracking-wide">Purchase Quantity</span>
                      
                      {/* Quantity Selector widget */}
                      <div className="flex items-center rounded-lg border border-slate-200 bg-white">
                        <button
                          onClick={handleDecrement}
                          disabled={quantity <= 1}
                          className="p-1.5 px-3 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer text-sm font-bold"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-3 text-sm font-bold text-slate-800">
                          {quantity}
                        </span>
                        <button
                          onClick={handleIncrement}
                          disabled={quantity >= product.stock}
                          className="p-1.5 px-3 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer text-sm font-bold"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleAddClick}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-center text-sm font-semibold tracking-wide text-white hover:bg-indigo-600 transition-colors"
                    >
                      <ShoppingCart className="h-4.5 w-4.5" />
                      <span>Add {quantity} to Cart — ${(product.price * quantity).toFixed(2)}</span>
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 bg-rose-50 border border-rose-100 text-rose-700 p-3.5 rounded-lg text-xs font-medium">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Depleted inventory. Store notifications are active for warehouse restocks.</span>
                  </div>
                )}
              </div>
              
            </div>
          </div>

          {/* Bottom Tabs Section: Specifications, Reviews, Shipping Policies */}
          <div className="p-6 text-left">
            {/* Tab Headers */}
            <div className="flex border-b border-slate-100 gap-6 text-xs font-semibold pb-3 mb-6">
              <button
                onClick={() => setActiveTab("specs")}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "specs"
                    ? "border-indigo-600 text-slate-900 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Sliders className="h-3.5 w-3.5" />
                Technical Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "reviews"
                    ? "border-indigo-600 text-slate-900 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Customer Reviews ({ratingInfo.count})
              </button>
              <button
                onClick={() => setActiveTab("shipping")}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "shipping"
                    ? "border-indigo-600 text-slate-900 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                <Truck className="h-3.5 w-3.5" />
                Shipping & Warranties
              </button>
            </div>

            {/* Tab body contents */}
            {activeTab === "specs" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {specs.map((spec, sidx) => (
                  <div key={sidx} className="flex justify-between pb-2.5 border-b border-dashed border-slate-100 text-xs">
                    <span className="font-medium text-slate-400">{spec.label}</span>
                    <span className="font-bold text-slate-700 text-right max-w-[200px]">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "shipping" && (
              <div className="space-y-4 text-xs text-slate-500 leading-relaxed max-w-2xl">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Standard Global Courier Dispatch</h4>
                  <p>All items undergo triple packaging checks prior to tracking generation. Transit timings range between 3 up to 7 business periods depending on target continent routing parameters. Free standard transport activates on orders over $150.00.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">Sovereign 2-Year Guarantee Scheme</h4>
                  <p>This product includes complete component warranty support. Covers electrical controller drifts, stitch tension deflections, keycap fading, or physical material micro-fracturing under conventional workload setups.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-1">No-Friction Return Protocol</h4>
                  <p>Exchange requests can be generated securely within 30 days of shipment receipt, provided accessories show no physical abrasion indicators and retain original catalog packaging inserts.</p>
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Score and Distribution panels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-6 border-b border-slate-100">
                  {/* Left Column Score indicator */}
                  <div className="bg-slate-50 rounded-xl p-4 text-center space-y-2">
                    <div className="text-3xl font-extrabold text-slate-900 leading-none">
                      {ratingInfo.average.toFixed(1)}
                    </div>
                    <div className="flex justify-center text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(ratingInfo.average)
                              ? "fill-amber-500 text-amber-500"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                      Based on {ratingInfo.count} verified ratings
                    </p>
                  </div>

                  {/* Middle Column progress bars */}
                  <div className="md:col-span-2 space-y-1.5 self-center">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingCounts[star - 1];
                      const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="w-10 text-right font-medium">{star} stars</span>
                          <div className="h-2 flex-grow bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="w-8 text-left text-slate-400 font-semibold">{percentage.toFixed(0)}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews List & Submission Row */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                  {/* Reviews List (3/5 columns) */}
                  <div className="md:col-span-3 space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-2">Verified Feedbacks</h4>
                    {ratingInfo.reviews.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No feedback posts yet. Be the first to catalog your purchase review!</p>
                    ) : (
                      ratingInfo.reviews.map((rev) => (
                        <div key={rev.id} className="p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 space-y-1.5 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{rev.name}</span>
                            <span className="text-[10px] text-slate-400">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-500 gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-2.5 w-2.5 ${
                                  i < rev.rating
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-slate-200"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-slate-600 leading-relaxed font-normal">{rev.comment}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Write a Review Block (2/5 columns) */}
                  <div className="md:col-span-2 bg-slate-50/35 border border-slate-100 rounded-xl p-4 self-start">
                    <h4 className="font-semibold text-slate-800 text-xs uppercase tracking-wide mb-3 flex items-center gap-1">
                      Share Feedback
                    </h4>
                    
                    <form onSubmit={handlePostReview} className="space-y-3.5">
                      {reviewFeedback ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-2 text-[11px] text-emerald-800 font-medium">
                          <Check className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                          <span>{reviewFeedback}</span>
                        </div>
                      ) : (
                        <>
                          {/* Name Input */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                              Your Name
                            </label>
                            <input
                              type="text"
                              value={newReviewName}
                              onChange={(e) => setNewReviewName(e.target.value)}
                              placeholder="e.g. Liam Porter"
                              className="w-full text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 focus:outline-hidden focus:border-indigo-500 bg-white"
                              maxLength={35}
                            />
                          </div>

                          {/* Star Select */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                              Rating Score
                            </label>
                            <div className="flex gap-1.5 items-center">
                              {Array.from({ length: 5 }).map((_, idx) => {
                                const starVal = idx + 1;
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setNewReviewRating(starVal)}
                                    className="text-amber-500 transition-transform hover:scale-120 cursor-pointer"
                                  >
                                    <Star
                                      className={`h-5 w-5 ${
                                        starVal <= newReviewRating
                                          ? "fill-amber-500 text-amber-500"
                                          : "text-slate-200"
                                      }`}
                                    />
                                  </button>
                                );
                              })}
                              <span className="text-[11px] font-bold text-slate-700 ml-1">
                                {newReviewRating} / 5
                              </span>
                            </div>
                          </div>

                          {/* Comment Input */}
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">
                              Review description
                            </label>
                            <textarea
                              value={newReviewComment}
                              onChange={(e) => setNewReviewComment(e.target.value)}
                              placeholder="Describe your tactile feedback with the product..."
                              className="w-full text-xs border border-slate-200 rounded-lg py-1.5 px-2.5 h-20 resize-none focus:outline-hidden focus:border-indigo-500 bg-white"
                              required
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full cursor-pointer rounded-lg bg-slate-900 py-2 text-center text-xs font-semibold text-white hover:bg-indigo-600 transition-colors shadow-xs"
                          >
                            Submit Review
                          </button>
                        </>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
