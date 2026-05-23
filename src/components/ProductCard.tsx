import React from "react";
import { Product, User } from "../types";
import { Plus, Eye, KeyRound, AlertCircle, Sparkles, Star } from "lucide-react";
import { getProductRating } from "../utils/productDetails";

interface ProductCardProps {
  key?: string;
  product: Product;
  user: User | null;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

export default function ProductCard({
  product,
  user,
  onAddToCart,
  onProductClick,
  onEditProduct,
}: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const ratingDetails = getProductRating(product.id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs hover:shadow-md hover:border-slate-200 transition-all duration-300">
      
      {/* Product Image Stage */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1.5">
          {product.featured && (
            <span className="flex items-center gap-1 rounded-md bg-indigo-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              <Sparkles className="h-2.5 w-2.5 fill-white" /> Featured
            </span>
          )}
          {product.stock > 0 && product.stock <= 5 && (
            <span className="rounded-md bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              Only {product.stock} Left!
            </span>
          )}
          {isOutOfStock && (
            <span className="rounded-md bg-slate-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-xs">
              Sold Out
            </span>
          )}
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={() => onProductClick(product)}
            className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-lg hover:scale-105 transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Quick View</span>
          </button>
        </div>

        {/* Actual Image */}
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      {/* Information Details block */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
          {product.category}
        </span>
        <h3 
          onClick={() => onProductClick(product)}
          className="mt-1 flex-1 font-display text-sm font-semibold text-slate-800 hover:text-indigo-600 cursor-pointer line-clamp-1"
        >
          {product.name}
        </h3>
        
        {/* Rating Line */}
        <div className="mt-1 mb-2 flex items-center gap-1">
          <div className="flex text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.round(ratingDetails.average)
                    ? "fill-amber-500 text-amber-500"
                    : "text-slate-200"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-800 ml-0.5">
            {ratingDetails.average.toFixed(1)}
          </span>
          <span className="text-[10px] font-medium text-slate-400">
            ({ratingDetails.count} reviews)
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
          {/* Price */}
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-400">Price</span>
            <span className="font-display font-bold text-slate-900">${product.price.toFixed(2)}</span>
          </div>

          {/* Action buttons based on Role */}
          {user && user.role === "admin" && onEditProduct ? (
            <button
              onClick={() => onEditProduct(product)}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 cursor-pointer transition-all"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Modify</span>
            </button>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer transition-all duration-205 ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-indigo-600 text-white shadow-xs hover:bg-slate-900"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
