"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api/axios";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";

/* ───────── Image Gallery ───────── */
function ImageGallery({ images }: { images: { id: number; image: string; is_primary: boolean }[] }) {
  const [active, setActive] = useState(0);
  const sorted = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));

  if (sorted.length === 0) {
    return (
      <div
        style={{
          height: 420,
          borderRadius: 20,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 64,
        }}
      >
        🛍️
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          height: 420,
          borderRadius: 20,
          overflow: "hidden",
          background: "#f0f0f0",
        }}
      >
        <img
          src={sorted[active]?.image}
          alt="Product"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      {sorted.length > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto" }}>
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              style={{
                width: 72,
                height: 72,
                borderRadius: 12,
                overflow: "hidden",
                border: i === active ? "2px solid #1a5fa8" : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                background: "none",
                flexShrink: 0,
              }}
            >
              <img
                src={img.image}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ───────── Star Rating ───────── */
function Stars({ rating, count }: { rating: number; count: number }) {
  const full = Math.round(rating);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ color: "#f4a92a", fontSize: 18, letterSpacing: 2 }}>
        {"★".repeat(full)}
        {"☆".repeat(5 - full)}
      </span>
      <span style={{ color: "#888", fontSize: 14 }}>
        {Number(rating).toFixed(1)} ({count} review{count !== 1 ? "s" : ""})
      </span>
    </div>
  );
}

/* ───────── Review Card ───────── */
function ReviewCard({
  review,
}: {
  review: {
    id: number;
    user: string;
    rating: number;
    comment: string;
    created_at: string;
    is_verified_purchase: boolean;
    vendor_response?: string;
  };
}) {
  return (
    <div
      style={{
        padding: "20px 24px",
        borderRadius: 14,
        background: "#fff",
        boxShadow: "0 1px 6px rgba(0,0,0,.05)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {review.user?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <span style={{ fontWeight: 600, color: "#0B1F3A", fontSize: 14 }}>{review.user}</span>
            {review.is_verified_purchase && (
              <span
                style={{
                  marginLeft: 8,
                  fontSize: 11,
                  background: "#e6fffa",
                  color: "#2f855a",
                  padding: "2px 8px",
                  borderRadius: 4,
                  fontWeight: 600,
                }}
              >
                ✓ Verified
              </span>
            )}
          </div>
        </div>
        <span style={{ color: "#aaa", fontSize: 12 }}>
          {new Date(review.created_at).toLocaleDateString()}
        </span>
      </div>
      <div style={{ color: "#f4a92a", fontSize: 14, marginBottom: 8 }}>
        {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
      </div>
      <p style={{ color: "#444", lineHeight: 1.6, margin: 0, fontSize: 14 }}>{review.comment}</p>
      {review.vendor_response && (
        <div
          style={{
            marginTop: 12,
            padding: "12px 16px",
            background: "#f7f8fa",
            borderRadius: 10,
            borderLeft: "3px solid #1a5fa8",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: "#1a5fa8" }}>Vendor Response</span>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#555" }}>{review.vendor_response}</p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ Product Detail Page ═══════════════════ */
export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!params?.id) return;

    const load = async () => {
      setLoading(true);
      try {
        const [prodRes, revRes] = await Promise.all([
          api.get(`/api/products/catalog/${params.id}/`),
          api.get(`/api/products/reviews/`, { params: { product: params.id } }).catch(() => ({ data: [] })),
        ]);
        setProduct(prodRes.data);
        const revData = revRes.data;
        setReviews(Array.isArray(revData) ? revData : revData.results ?? []);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Product not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [params?.id]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fc", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 48,
            height: 48,
            border: "4px solid #eee",
            borderTopColor: "#1a5fa8",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !product) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fc", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <div style={{ fontSize: 48 }}>😕</div>
        <h2 style={{ color: "#0B1F3A", fontSize: 24, margin: 0 }}>{error || "Product not found"}</h2>
        <Link href="/home">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const inStock = (product.stock ?? 0) > 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      {/* Breadcrumb */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 24px 0" }}>
        <nav style={{ fontSize: 13, color: "#888", display: "flex", gap: 6 }}>
          <Link href="/home" style={{ color: "#1a5fa8", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <span style={{ color: "#555" }}>{product.category_name || "Products"}</span>
          <span>/</span>
          <span style={{ color: "#0B1F3A", fontWeight: 500 }}>{product.name}</span>
        </nav>
      </div>

      {/* Main Content */}
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "24px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
        }}
      >
        {/* Left — Gallery */}
        <ImageGallery images={(product.images || []) as any} />

        {/* Right — Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Featured badge */}
          {product.is_featured && (
            <span
              style={{
                alignSelf: "flex-start",
                background: "#f4a92a",
                color: "#fff",
                padding: "4px 14px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              ⭐ Featured
            </span>
          )}

          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#0B1F3A", margin: 0, lineHeight: 1.2 }}>
            {product.name}
          </h1>

          {/* Vendor */}
          <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
            Sold by <span style={{ fontWeight: 600, color: "#1a5fa8" }}>{typeof product.vendor === "string" ? product.vendor : (product.vendor as any)?.name ?? "Sooqly Vendor"}</span>
          </p>

          {/* Rating */}
          <Stars rating={product.average_rating || 0} count={product.total_reviews || 0} />

          {/* Price */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: "#1a5fa8" }}>
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          {/* Stock */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: inStock ? "#48bb78" : "#e53e3e",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: 14, fontWeight: 500, color: inStock ? "#48bb78" : "#e53e3e" }}>
              {inStock ? `In Stock (${product.stock} available)` : "Out of Stock"}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0B1F3A", marginBottom: 8 }}>Description</h3>
            <p style={{ color: "#555", lineHeight: 1.7, margin: 0, fontSize: 14 }}>
              {product.description}
            </p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0B1F3A", marginBottom: 10 }}>Variants</h3>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.variants.map((v: any) => (
                  <button
                    key={v.id}
                    style={{
                      padding: "8px 16px",
                      border: "1px solid #ddd",
                      borderRadius: 10,
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#0B1F3A",
                      transition: "all .2s",
                    }}
                  >
                    {v.name}: {v.value}
                    {Number(v.price_adjustment) !== 0 && (
                      <span style={{ color: "#888", marginLeft: 6 }}>
                        {Number(v.price_adjustment) > 0 ? "+" : ""}${Number(v.price_adjustment).toFixed(2)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "20px 0",
              borderTop: "1px solid #eee",
              borderBottom: "1px solid #eee",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1px solid #ddd",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                style={{
                  width: 40,
                  height: 44,
                  border: "none",
                  background: "#f7f7f7",
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0B1F3A",
                }}
              >
                −
              </button>
              <span
                style={{
                  width: 48,
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#0B1F3A",
                }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
                style={{
                  width: 40,
                  height: 44,
                  border: "none",
                  background: "#f7f7f7",
                  cursor: "pointer",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#0B1F3A",
                }}
              >
                +
              </button>
            </div>

            <Button variant="primary" size="lg" disabled={!inStock} style={{ flex: 1 }}>
              {inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>

          {/* Meta info */}
          <div style={{ display: "flex", gap: 24, fontSize: 13, color: "#888" }}>
            <span>📦 {product.is_digital ? "Digital Delivery" : "Physical Product"}</span>
            <span>📅 Added {product.created_at ? new Date(product.created_at).toLocaleDateString() : "—"}</span>
          </div>
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 60px" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0B1F3A", marginBottom: 20 }}>
          Customer Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "#fff",
              borderRadius: 16,
              color: "#888",
            }}
          >
            <p style={{ fontSize: 16, margin: 0 }}>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        )}
      </section>

      {/* Responsive override for mobile */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
