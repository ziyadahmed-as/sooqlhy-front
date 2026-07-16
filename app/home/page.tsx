"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useProductStore } from "@/stores/product-store";
import { useAuthStore } from "@/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { Card } from "@/components/ui/card";

/* ──────────────────── Product Card (inline) ──────────────────── */
function ProductCard({ product }: { product: Product }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 2px 16px rgba(0,0,0,.07)",
        display: "flex",
        flexDirection: "column",
        transition: "transform .2s, box-shadow .2s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 8px 32px rgba(0,0,0,.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow =
          "0 2px 16px rgba(0,0,0,.07)";
      }}
    >
      {/* Image placeholder — uses first product image or a gradient */}
      <div
        style={{
          height: 200,
          background: product.images?.[0]
            ? `url(${typeof product.images[0] === "string" ? product.images[0] : (product.images[0] as any).image ?? ""}) center/cover`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "flex-end",
          padding: 12,
        }}
      >
        {product.is_featured && (
          <span
            style={{
              background: "#f4a92a",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 6,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            Featured
          </span>
        )}
      </div>

      <div style={{ padding: "16px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 12, color: "#888", margin: 0 }}>
          {product.category_name || "General"}
        </p>
        <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#0B1F3A" }}>
          {product.name}
        </h3>

        {/* Rating */}
        {(product.average_rating ?? 0) > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#f4a92a" }}>
            {"★".repeat(Math.round(product.average_rating ?? 0))}
            <span style={{ color: "#999", marginLeft: 4 }}>
              ({product.total_reviews})
            </span>
          </div>
        )}

        <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#1a5fa8" }}>
            ${Number(product.price).toFixed(2)}
          </span>
          <Button variant="primary" size="sm">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── Empty State ──────────────────── */
function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "80px 20px",
        color: "#666",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>🛍️</div>
      <h2 style={{ fontSize: 24, fontWeight: 600, color: "#0B1F3A", marginBottom: 8 }}>
        No products yet
      </h2>
      <p style={{ maxWidth: 400, margin: "0 auto", lineHeight: 1.6 }}>
        Products will appear here once vendors start adding them. Check back
        soon!
      </p>
    </div>
  );
}

/* ──────────────────── Home Page ──────────────────── */
export default function HomePage() {
  const { products, loading, error, fetchProducts, fetchCategories, categories } =
    useProductStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      {/* ── Hero Section ── */}
      <section
        style={{
          background: "linear-gradient(135deg, #0B1F3A 0%, #1a5fa8 60%, #667eea 100%)",
          color: "#fff",
          padding: "80px 24px 60px",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,.04)",
            top: -80,
            right: -60,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,.06)",
            bottom: -40,
            left: -30,
          }}
        />

        <h1
          style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 800,
            margin: "0 0 12px",
            letterSpacing: -0.5,
            position: "relative",
          }}
        >
          Welcome to <span style={{ color: "#f4a92a" }}>Sooqly</span>
        </h1>
        <p
          style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            opacity: 0.85,
            maxWidth: 560,
            margin: "0 auto 32px",
            lineHeight: 1.5,
            position: "relative",
          }}
        >
          Your premium multi‑vendor marketplace — discover quality products from
          trusted sellers.
        </p>

        {user && (
          <Link href="/dashboard">
            <Button variant="accent" size="lg">
              Go to Dashboard
            </Button>
          </Link>
        )}
      </section>

      {/* ── Categories Ribbon ── */}
      {categories.length > 0 && (
        <section
          style={{
            display: "flex",
            gap: 12,
            padding: "20px 24px",
            overflowX: "auto",
            background: "#fff",
            borderBottom: "1px solid #eee",
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => fetchProducts({ category: String(cat.id) })}
              style={{
                padding: "8px 20px",
                borderRadius: 999,
                border: "1px solid #ddd",
                background: "#fff",
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all .2s",
                color: "#0B1F3A",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#1a5fa8";
                (e.currentTarget as HTMLElement).style.color = "#fff";
                (e.currentTarget as HTMLElement).style.borderColor = "#1a5fa8";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#fff";
                (e.currentTarget as HTMLElement).style.color = "#0B1F3A";
                (e.currentTarget as HTMLElement).style.borderColor = "#ddd";
              }}
            >
              {cat.name}
            </button>
          ))}
        </section>
      )}

      {/* ── Product Grid ── */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#0B1F3A", margin: 0 }}>
            All Products
          </h2>
          <button
            onClick={() => fetchProducts()}
            style={{
              background: "none",
              border: "none",
              color: "#1a5fa8",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Show All
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 340,
                  borderRadius: 16,
                  background:
                    "linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%)",
                  backgroundSize: "200% 100%",
                  animation: "shimmer 1.5s infinite",
                }}
              />
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              background: "#fff5f5",
              border: "1px solid #fed7d7",
              borderRadius: 12,
              padding: "16px 24px",
              color: "#c53030",
              marginBottom: 24,
            }}
          >
            {error}
          </div>
        )}

        {/* Products */}
        {!loading && !error && products.length === 0 && <EmptyState />}
        {!loading && products.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {products.map((p) => (
              <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <ProductCard product={p} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Shimmer keyframes */}
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
