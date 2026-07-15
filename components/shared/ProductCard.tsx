"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ShoppingCart, Eye, Star, Zap, Sparkles, TrendingUp } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  /** Display as compact card (smaller height) */
  compact?: boolean;
  /** Display as list item (horizontal layout) */
  listView?: boolean;
  /** Callback when quick-view is requested */
  onQuickView?: (product: Product) => void;
}

function getImageSrc(product: Product): string {
  if (!product.images || product.images.length === 0) return "/placeholder.jpg";
  const img = product.images[0];
  if (typeof img === "string") return img;
  return img?.image || "/placeholder.jpg";
}

function DiscountBadge({ original, current }: { original: number; current: number }) {
  if (!original || original <= current) return null;
  const pct = Math.round(((original - current) / original) * 100);
  return (
    <span className="absolute top-2 left-2 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wide">
      -{pct}%
    </span>
  );
}

function FeaturedBadge() {
  return (
    <span className="absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wide">
      <Sparkles className="h-2.5 w-2.5" /> Featured
    </span>
  );
}

function NewBadge() {
  return (
    <span className="absolute top-2 right-2 z-10 flex items-center gap-0.5 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wide">
      <Zap className="h-2.5 w-2.5" /> New
    </span>
  );
}

function StockBadge({ inStock }: { inStock: boolean }) {
  if (inStock) return null;
  return (
    <div className="absolute inset-0 z-10 rounded-xl bg-black/40 flex items-center justify-center">
      <span className="bg-black/70 text-white text-xs font-bold px-3 py-1 rounded-full">
        Out of Stock
      </span>
    </div>
  );
}

export default function ProductCard({
  product,
  compact = false,
  listView = false,
  onQuickView,
}: ProductCardProps) {
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();

  const title = product.title || product.name || "Unnamed Product";
  const imgSrc = imgError ? "/placeholder.jpg" : getImageSrc(product);
  const price = product.price ?? 0;
  const originalPrice = product.original_price;
  const rating = product.avg_rating ?? product.average_rating ?? 0;
  const reviewCount = product.total_reviews ?? 0;
  const inStock = product.stock == null || product.stock > 0;
  const wishlisted = isWishlisted(product.id);

  const vendorName =
    typeof product.vendor === "string"
      ? product.vendor
      : product.vendor?.name || "";

  const isNew =
    product.created_at
      ? Date.now() - new Date(product.created_at).getTime() < 7 * 24 * 3600 * 1000
      : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem(product, 1);
    toast.success("Added to cart", { duration: 1500 });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist", { duration: 1500 });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  // ── List View ──────────────────────────────────────────────────────────────
  if (listView) {
    return (
      <Link
        href={`/products/${product.id}`}
        className="flex gap-4 rounded-xl border border-gray-200 bg-white p-3 hover:shadow-md transition-shadow group"
        aria-label={title}
      >
        <div className="relative h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
          <Image
            src={imgSrc}
            alt={title}
            fill
            sizes="96px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        </div>
        <div className="flex flex-1 flex-col justify-between min-w-0">
          <div>
            <p className="text-xs text-gray-500 truncate">{product.category_name || vendorName}</p>
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#FF4747] transition-colors">
              {title}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="text-xs text-gray-600">{Number(rating).toFixed(1)}</span>
              {reviewCount > 0 && <span className="text-xs text-gray-400">({reviewCount})</span>}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-[#FF4747]">${price.toFixed(2)}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex items-center gap-1 rounded-lg bg-[#FF4747] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              aria-label={`Add ${title} to cart`}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // ── Grid Card ──────────────────────────────────────────────────────────────
  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group relative flex flex-col rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
        compact ? "min-h-[260px]" : "min-h-[320px]"
      )}
      aria-label={title}
    >
      {/* Image */}
      <div className={cn("relative overflow-hidden bg-gray-50", compact ? "h-36" : "h-48")}>
        <Image
          src={imgSrc}
          alt={title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgError(true)}
        />

        {/* Badges */}
        <DiscountBadge original={originalPrice!} current={price} />
        {!originalPrice && product.is_featured && <FeaturedBadge />}
        {!product.is_featured && isNew && <NewBadge />}
        <StockBadge inStock={inStock} />

        {/* Action overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
        <div className="absolute top-2 right-2 z-20 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWishlist}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-colors",
              wishlisted
                ? "bg-red-500 text-white"
                : "bg-white text-gray-600 hover:bg-red-500 hover:text-white"
            )}
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
          </button>
          {onQuickView && (
            <button
              onClick={handleQuickView}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md text-gray-600 hover:bg-blue-500 hover:text-white transition-colors"
              aria-label="Quick view"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-3">
        {/* Category / Brand */}
        {(product.category_name || vendorName) && (
          <p className="text-[10px] text-gray-400 uppercase tracking-wider truncate">
            {product.category_name || vendorName}
          </p>
        )}

        {/* Title */}
        <h3 className="mt-1 text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-[#FF4747] transition-colors">
          {title}
        </h3>

        {/* Rating */}
        {rating > 0 && (
          <div className="mt-1.5 flex items-center gap-1">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
            <span className="text-xs font-semibold text-gray-700">{Number(rating).toFixed(1)}</span>
            {reviewCount > 0 && (
              <span className="text-xs text-gray-400">({reviewCount})</span>
            )}
          </div>
        )}

        {/* Price */}
        <div className="mt-auto pt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-[#FF4747]">${price.toFixed(2)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-xs text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex items-center gap-1 rounded-lg bg-[#FF4747] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
            aria-label={`Add ${title} to cart`}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            {compact ? "" : "Add"}
          </button>
        </div>

        {/* Free shipping badge */}
        {(product as any).free_shipping && (
          <p className="mt-1.5 text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5">
            <TrendingUp className="h-2.5 w-2.5" /> Free Shipping
          </p>
        )}
      </div>
    </Link>
  );
}
