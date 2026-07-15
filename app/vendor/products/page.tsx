"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  fetchVendorProducts,
  deleteVendorProduct,
  submitProductForReview,
} from "@/lib/api/vendor";
import { updateVendorProduct } from "@/lib/api/vendor";
import type { VendorProduct } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  Package, Plus, Search, SlidersHorizontal, LayoutGrid, LayoutList,
  Edit, Trash2, Eye, Send, CheckCircle, XCircle, Clock, AlertTriangle,
  MoreVertical, ArrowUpDown, RefreshCw, X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "All",          value: "" },
  { label: "Approved",     value: "APPROVED" },
  { label: "Draft",        value: "DRAFT" },
  { label: "Pending",      value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Rejected",     value: "REJECTED" },
  { label: "Archived",     value: "ARCHIVED" },
];

const STATUS_STYLES: Record<string, string> = {
  APPROVED:     "bg-emerald-50 text-emerald-700",
  DRAFT:        "bg-gray-100 text-gray-500",
  SUBMITTED:    "bg-blue-50 text-blue-700",
  UNDER_REVIEW: "bg-amber-50 text-amber-700",
  REJECTED:     "bg-red-50 text-red-600",
  ARCHIVED:     "bg-gray-100 text-gray-400",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  APPROVED:     <CheckCircle className="w-3.5 h-3.5" />,
  DRAFT:        <Clock className="w-3.5 h-3.5" />,
  SUBMITTED:    <Send className="w-3.5 h-3.5" />,
  UNDER_REVIEW: <Eye className="w-3.5 h-3.5" />,
  REJECTED:     <XCircle className="w-3.5 h-3.5" />,
  ARCHIVED:     <Package className="w-3.5 h-3.5" />,
};

const SORT_OPTIONS = [
  { label: "Newest First",    value: "-created_at" },
  { label: "Oldest First",    value: "created_at" },
  { label: "Price: Low–High", value: "price" },
  { label: "Price: High–Low", value: "-price" },
  { label: "Name A–Z",        value: "name" },
  { label: "Stock: Low–High", value: "stock" },
];

// ─── Product image helper ─────────────────────────────────────────────────────
function getImg(p: VendorProduct): string {
  if (!p.images || p.images.length === 0) return "";
  const img = p.images[0];
  if (typeof img === "string") return img;
  return (img as any).image || "";
}

// ─── Status chip ──────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide", STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500")}>
      {STATUS_ICONS[status]}
      {status.replace("_", " ")}
    </span>
  );
}

// ─── Action menu ─────────────────────────────────────────────────────────────
interface ActionMenuProps {
  product: VendorProduct;
  onDelete: (id: string) => void;
  onToggleActive: (product: VendorProduct) => void;
  onSubmitReview: (id: string) => void;
  busy: boolean;
}

function ActionMenu({ product, onDelete, onToggleActive, onSubmitReview, busy }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const canSubmit = product.status === "DRAFT" || product.status === "REJECTED";

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
        aria-label="Product actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-48 bg-white rounded-xl border border-gray-200 shadow-xl py-1 text-sm">
            <Link
              href={`/vendor/products/${product.id}/edit`}
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Edit className="w-4 h-4 text-gray-400" /> Edit Product
            </Link>
            <Link
              href={`/products/${product.id}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50"
              onClick={() => setOpen(false)}
            >
              <Eye className="w-4 h-4 text-gray-400" /> View Listing
            </Link>
            {canSubmit && (
              <button
                onClick={() => { onSubmitReview(product.id); setOpen(false); }}
                disabled={busy}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-blue-600 hover:bg-blue-50 disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> Submit for Review
              </button>
            )}
            <button
              onClick={() => { onToggleActive(product); setOpen(false); }}
              disabled={busy}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {product.is_active
                ? <><XCircle className="w-4 h-4 text-gray-400" /> Unpublish</>
                : <><CheckCircle className="w-4 h-4 text-gray-400" /> Publish</>}
            </button>
            <div className="border-t border-gray-100 mt-1 pt-1">
              <button
                onClick={() => { onDelete(product.id); setOpen(false); }}
                disabled={busy}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Product row (list view) ──────────────────────────────────────────────────
function ProductRow({ product, onDelete, onToggleActive, onSubmitReview, busy }: {
  product: VendorProduct;
  onDelete: (id: string) => void;
  onToggleActive: (p: VendorProduct) => void;
  onSubmitReview: (id: string) => void;
  busy: boolean;
}) {
  const img = getImg(product);
  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 overflow-hidden">
        {img ? (
          <Image src={img} alt={product.name || ""} width={48} height={48} className="w-full h-full object-cover" />
        ) : (
          <Package className="w-5 h-5 text-gray-300 m-auto mt-3.5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-400">{product.category_name || "Uncategorized"}</p>
      </div>
      <div className="hidden sm:block text-sm font-bold text-navy w-20 text-right">
        ${Number(product.price).toFixed(2)}
      </div>
      <div className="hidden md:block text-sm text-gray-500 w-20 text-right">
        {product.stock ?? 0} units
      </div>
      <div className="hidden sm:block w-28 text-right">
        <StatusChip status={product.status || "DRAFT"} />
      </div>
      {product.status === "REJECTED" && product.rejection_reason && (
        <div className="hidden lg:block max-w-[200px]">
          <p className="text-[11px] text-red-500 line-clamp-1">{product.rejection_reason}</p>
        </div>
      )}
      <ActionMenu
        product={product}
        onDelete={onDelete}
        onToggleActive={onToggleActive}
        onSubmitReview={onSubmitReview}
        busy={busy}
      />
    </div>
  );
}

// ─── Product card (grid view) ─────────────────────────────────────────────────
function ProductGrid({ product, onDelete, onToggleActive, onSubmitReview, busy }: {
  product: VendorProduct;
  onDelete: (id: string) => void;
  onToggleActive: (p: VendorProduct) => void;
  onSubmitReview: (id: string) => void;
  busy: boolean;
}) {
  const img = getImg(product);
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
      {/* Image */}
      <div className="relative h-40 bg-gray-50 overflow-hidden">
        {img ? (
          <Image src={img} alt={product.name || ""} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-200" />
          </div>
        )}
        {/* Status overlay */}
        <div className="absolute top-2 left-2">
          <StatusChip status={product.status || "DRAFT"} />
        </div>
        {/* Actions overlay */}
        <div className="absolute top-2 right-2">
          <ActionMenu
            product={product}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            onSubmitReview={onSubmitReview}
            busy={busy}
          />
        </div>
      </div>
      {/* Body */}
      <div className="p-3">
        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{product.category_name || "Uncategorized"}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-black text-navy">${Number(product.price).toFixed(2)}</span>
          <span className={cn("text-xs font-semibold", (product.stock ?? 0) === 0 ? "text-red-500" : "text-gray-500")}>
            {(product.stock ?? 0) === 0 ? "Out of stock" : `${product.stock} in stock`}
          </span>
        </div>
        {product.status === "REJECTED" && product.rejection_reason && (
          <p className="mt-2 text-[11px] text-red-500 bg-red-50 rounded-lg px-2 py-1.5 line-clamp-2">
            {product.rejection_reason}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Page Content ─────────────────────────────────────────────────────────────
function VendorProductsContent() {
  const [allProducts, setAllProducts]   = useState<VendorProduct[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [busyId, setBusyId]             = useState<string | null>(null);

  const [searchInput, setSearchInput]   = useState("");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy]             = useState("-created_at");
  const [gridView, setGridView]         = useState(true);

  // Load all vendor products
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchVendorProducts();
      setAllProducts(data);
    } catch (err: unknown) {
      setError((err as any)?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  // ── Client-side filter + sort ──
  const filtered = allProducts
    .filter((p) => {
      const matchStatus = !statusFilter || p.status === statusFilter;
      const matchSearch = !search ||
        (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (p.description || "").toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "-created_at":  return (b.created_at ?? "") > (a.created_at ?? "") ? 1 : -1;
        case "created_at":   return (a.created_at ?? "") > (b.created_at ?? "") ? 1 : -1;
        case "price":        return Number(a.price) - Number(b.price);
        case "-price":       return Number(b.price) - Number(a.price);
        case "name":         return (a.name || "").localeCompare(b.name || "");
        case "stock":        return (a.stock ?? 0) - (b.stock ?? 0);
        default:             return 0;
      }
    });

  // ── Handlers ──
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) return;
    setBusyId(id);
    try {
      await deleteVendorProduct(id);
      setAllProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Product deleted.");
    } catch {
      toast.error("Failed to delete product.");
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleActive = async (product: VendorProduct) => {
    setBusyId(product.id);
    try {
      const fd = new FormData();
      fd.append("is_active", String(!product.is_active));
      await updateVendorProduct(product.id, fd);
      setAllProducts((prev) =>
        prev.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p)
      );
      toast.success(product.is_active ? "Product unpublished." : "Product published.");
    } catch {
      toast.error("Failed to update product.");
    } finally {
      setBusyId(null);
    }
  };

  const handleSubmitForReview = async (id: string) => {
    setBusyId(id);
    try {
      const res = await submitProductForReview(id);
      setAllProducts((prev) =>
        prev.map((p) => p.id === id ? { ...p, status: "SUBMITTED" } : p)
      );
      toast.success(res.message || "Product submitted for review.");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to submit product.");
    } finally {
      setBusyId(null);
    }
  };

  // Tab counts
  const tabCounts: Record<string, number> = { "": allProducts.length };
  allProducts.forEach((p) => {
    tabCounts[p.status || "DRAFT"] = (tabCounts[p.status || "DRAFT"] || 0) + 1;
  });

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-xl font-black text-navy flex items-center gap-2">
            <Package className="w-5 h-5" />
            My Products
            <span className="text-sm font-semibold text-gray-400">({allProducts.length})</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={loadProducts}
              className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-navy transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              href="/vendor/products/new"
              className="flex items-center gap-2 px-4 py-2.5 bg-navy text-white text-sm font-bold rounded-xl hover:bg-trust transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Status tabs */}
        <div className="max-w-7xl mx-auto px-4 border-t border-gray-100">
          <div className="flex items-center gap-0 overflow-x-auto scrollbar-none -mb-px">
            {STATUS_TABS.map((tab) => {
              const count = tabCounts[tab.value] ?? 0;
              const active = statusFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={cn(
                    "flex-shrink-0 flex items-center gap-1.5 px-3 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap",
                    active
                      ? "border-navy text-navy"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200"
                  )}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-black", active ? "bg-navy text-white" : "bg-gray-100 text-gray-500")}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* ── Toolbar ── */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setSearch(searchInput)}
              placeholder="Search products…"
              className="w-full pl-9 pr-8 py-2.5 text-sm rounded-xl border-2 border-gray-200 focus:border-navy focus:outline-none bg-gray-50 focus:bg-white transition-all"
            />
            {searchInput && (
              <button
                onClick={() => { setSearchInput(""); setSearch(""); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 border-2 border-gray-200 rounded-xl px-3 py-2 bg-white focus-within:border-navy transition-colors">
            <ArrowUpDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm bg-transparent focus:outline-none text-gray-700 cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border-2 border-gray-200">
            <button
              onClick={() => setGridView(true)}
              className={cn("p-2.5 transition-colors", gridView ? "bg-navy text-white" : "bg-white text-gray-500 hover:bg-gray-50")}
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridView(false)}
              className={cn("p-2.5 border-l-2 border-gray-200 transition-colors", !gridView ? "bg-navy text-white" : "bg-white text-gray-500 hover:bg-gray-50")}
              aria-label="List view"
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className={gridView ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-1"}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={loadProducts} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search || statusFilter ? "No products match your filters" : "No products yet"}
            description={search || statusFilter ? "Try adjusting your search or filter." : "Start by adding your first product."}
          />
        ) : gridView ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductGrid
                key={p.id}
                product={p}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onSubmitReview={handleSubmitForReview}
                busy={busyId === p.id}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* List header */}
            <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <div className="w-12 flex-shrink-0" />
              <div className="flex-1">Product</div>
              <div className="w-20 text-right">Price</div>
              <div className="w-20 text-right hidden md:block">Stock</div>
              <div className="w-28 text-right">Status</div>
              <div className="w-8" />
            </div>
            {filtered.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
                onSubmitReview={handleSubmitForReview}
                busy={busyId === p.id}
              />
            ))}
          </div>
        )}

        {/* Result count */}
        {!loading && !error && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Showing {filtered.length} of {allProducts.length} products
          </p>
        )}
      </div>
    </div>
  );
}

export default function VendorProductsPage() {
  return <VendorProductsContent />;
}
