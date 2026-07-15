"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Heart, Star, ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);
  const addItem = useCartStore((s) => s.addItem);
  const { toggleItem, isWishlisted } = useWishlistStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  useEffect(() => { setQty(1); setActiveImg(0); }, [product]);

  if (!product) return null;

  const title = product.title || product.name || "Product";
  const price = product.price ?? 0;
  const originalPrice = product.original_price;
  const rating = product.avg_rating ?? product.average_rating ?? 0;
  const inStock = product.stock == null || product.stock > 0;
  const wishlisted = isWishlisted(product.id);

  const images: string[] = (() => {
    if (!product.images || product.images.length === 0) return ["/placeholder.jpg"];
    return product.images.map((img) =>
      typeof img === "string" ? img : img?.image || "/placeholder.jpg"
    );
  })();

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${title}`}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />

      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-white/90 p-1.5 shadow text-gray-500 hover:text-gray-900 transition-colors"
          aria-label="Close quick view"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex flex-col md:flex-row overflow-auto">
          {/* Gallery */}
          <div className="relative md:w-64 flex-shrink-0 bg-gray-50">
            <div className="relative h-64 w-full">
              <Image
                src={images[activeImg]}
                alt={title}
                fill
                className="object-cover"
                sizes="256px"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setActiveImg((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-1.5 p-2 overflow-x-auto">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={cn(
                      "relative h-12 w-12 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors",
                      i === activeImg ? "border-[#FF4747]" : "border-transparent"
                    )}
                    aria-label={`Image ${i + 1}`}
                  >
                    <Image src={src} alt="" fill sizes="48px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-5 flex flex-col gap-3 overflow-y-auto">
            {product.category_name && (
              <p className="text-xs text-gray-400 uppercase tracking-wider">{product.category_name}</p>
            )}
            <h2 className="text-lg font-bold text-gray-900 leading-snug">{title}</h2>

            {rating > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn("h-3.5 w-3.5", i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-200")}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">({product.total_reviews ?? 0} reviews)</span>
              </div>
            )}

            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#FF4747]">${price.toFixed(2)}</span>
              {originalPrice && originalPrice > price && (
                <span className="text-sm text-gray-400 line-through">${originalPrice.toFixed(2)}</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className={cn("text-xs font-semibold", inStock ? "text-emerald-600" : "text-red-500")}>
                {inStock ? "✓ In Stock" : "✗ Out of Stock"}
              </span>
              {product.stock != null && inStock && (
                <span className="text-xs text-gray-400">({product.stock} left)</span>
              )}
            </div>

            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Decrease quantity"
                >−</button>
                <span className="w-10 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Increase quantity"
                >+</button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto pt-2">
              <button
                onClick={() => {
                  if (!inStock) return;
                  addItem(product, qty);
                  toast.success("Added to cart");
                  onClose();
                }}
                disabled={!inStock}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#FF4747] py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>
              <button
                onClick={() => {
                  toggleItem(product);
                  toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist");
                }}
                className={cn(
                  "flex items-center justify-center rounded-lg border p-2.5 transition-colors",
                  wishlisted ? "border-red-300 bg-red-50 text-red-500" : "border-gray-300 text-gray-500 hover:border-red-300 hover:text-red-500"
                )}
                aria-label="Toggle wishlist"
              >
                <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} />
              </button>
            </div>

            <Link
              href={`/products/${product.id}`}
              onClick={onClose}
              className="text-center text-xs text-blue-600 hover:underline"
            >
              View full details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
