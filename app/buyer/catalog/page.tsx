"use client";
import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search, LayoutGrid, LayoutList, ArrowUpDown,
  ChevronRight, Home, SlidersHorizontal, X, ArrowLeft,
  TrendingUp,
} from "lucide-react";
import { fetchCatalog, fetchCategories } from "@/lib/api/catalog";
import type { Product, Category } from "@/lib/types";
import QuickViewModal from "@/components/shared/QuickViewModal";
import { Pagination } from "@/components/shared/Pagination";
import FilterSidebar, { ActiveFilters, EMPTY_FILTERS } from "@/components/catalog/FilterSidebar";
import ActiveFilterChips from "@/components/catalog/ActiveFilterChips";
import ProductGrid from "@/components/catalog/ProductGrid";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 16;

const SORT_OPTIONS = [
  { label: "Newest First",    value: "-created_at" },
  { label: "Popularity",      value: "-add_to_cart_count" },
  { label: "Price: Low–High", value: "price" },
  { label: "Price: High–Low", value: "-price" },
  { label: "Top Rated",       value: "-average_rating" },
  { label: "Best Selling",    value: "-total_reviews" },
];

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ categoryName }: { categoryName?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500">
      <Link href="/" className="hover:text-navy transition-colors flex items-center gap-1">
        <Home className="w-3.5 h-3.5" />
        Home
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
      <Link href="/buyer/catalog" className={cn("hover:text-navy transition-colors", !categoryName && "text-navy font-semibold pointer-events-none")}>
        All Products
      </Link>
      {categoryName && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="text-navy font-semibold truncate max-w-[160px]">{categoryName}</span>
        </>
      )}
    </nav>
  );
}

// ─── Dashboard Header ─────────────────────────────────────────────────────────
interface HeaderProps {
  total: number;
  loading: boolean;
  searchInput: string;
  onSearchInput: (v: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  ordering: string;
  onOrderingChange: (v: string) => void;
  gridView: boolean;
  onGridView: (v: boolean) => void;
  onMobileFilterOpen: () => void;
  activeFilterCount: number;
  categoryName?: string;
}

function DashboardHeader({
  total, loading, searchInput, onSearchInput, onSearchSubmit,
  ordering, onOrderingChange, gridView, onGridView,
  onMobileFilterOpen, activeFilterCount, categoryName,
}: HeaderProps) {
  return (
    <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      {/* Row 1: Breadcrumb + Title + Count */}
      <div className="max-w-[1400px] mx-auto px-4 pt-3 pb-2 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <Breadcrumb categoryName={categoryName} />
          <h1 className="text-lg font-black text-navy flex items-center gap-2 mt-0.5">
            <TrendingUp className="w-5 h-5 text-gold" />
            {categoryName ? categoryName : "All Products"}
            {!loading && (
              <span className="text-sm font-semibold text-gray-400 ml-1">
                ({total.toLocaleString()})
              </span>
            )}
          </h1>
        </div>
        {/* Mobile filter trigger */}
        <button
          onClick={onMobileFilterOpen}
          className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 text-sm font-semibold text-gray-700 hover:border-navy hover:text-navy transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-navy text-white text-[10px] flex items-center justify-center font-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Row 2: Search + Sort + View toggle */}
      <div className="max-w-[1400px] mx-auto px-4 pb-3 flex items-center gap-3 flex-wrap">
        <form onSubmit={onSearchSubmit} className="flex-1 min-w-[200px] max-w-xl relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => onSearchInput(e.target.value)}
            placeholder="Search products, brands, categories…"
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border-2 border-gray-200 focus:border-navy focus:outline-none bg-gray-50 focus:bg-white transition-all"
            aria-label="Search products"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => onSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          {/* Sort */}
          <div className="relative flex items-center gap-1.5 border-2 border-gray-200 rounded-xl px-3 py-2 bg-white hover:border-navy transition-colors focus-within:border-navy">
            <ArrowUpDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={ordering}
              onChange={(e) => onOrderingChange(e.target.value)}
              className="text-sm bg-transparent focus:outline-none text-gray-700 cursor-pointer pr-1"
              aria-label="Sort by"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Grid / List toggle */}
          <div className="flex rounded-xl overflow-hidden border-2 border-gray-200">
            <button
              onClick={() => onGridView(true)}
              className={cn(
                "p-2.5 transition-colors",
                gridView ? "bg-navy text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              )}
              aria-label="Grid view"
              aria-pressed={gridView}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onGridView(false)}
              className={cn(
                "p-2.5 border-l-2 border-gray-200 transition-colors",
                !gridView ? "bg-navy text-white" : "bg-white text-gray-500 hover:bg-gray-50"
              )}
              aria-label="List view"
              aria-pressed={!gridView}
            >
              <LayoutList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 3: spacer — chips are rendered below the header to avoid double render */}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function countActiveFilters(f: ActiveFilters): number {
  return [
    f.category, f.subcategory, f.brand,
    f.minPrice, f.maxPrice, f.minRating,
    f.inStock, f.onSale, f.condition, f.vendor, f.color, f.size,
  ].filter(Boolean).length;
}

function filtersToParams(f: ActiveFilters): Record<string, string | number | boolean> {
  const p: Record<string, string | number | boolean> = {};
  if (f.category)    p.category   = f.category;
  if (f.subcategory) p.category   = f.subcategory; // subcategory overrides category on backend
  if (f.brand)       p.brand      = f.brand;
  if (f.minPrice)    p.min_price  = Number(f.minPrice);
  if (f.maxPrice)    p.max_price  = Number(f.maxPrice);
  if (f.minRating)   p.min_rating = Number(f.minRating);
  if (f.inStock)     p.in_stock   = true;
  if (f.onSale)      p.on_sale    = true;
  if (f.condition)   p.condition  = f.condition;
  if (f.vendor)      p.vendor     = f.vendor;
  if (f.color)       p.color      = f.color;
  if (f.size)        p.size       = f.size;
  return p;
}

function urlToFilters(sp: URLSearchParams): ActiveFilters {
  return {
    category:    sp.get("category")    || "",
    subcategory: sp.get("subcategory") || "",
    brand:       sp.get("brand")       || "",
    minPrice:    sp.get("min_price")   || "",
    maxPrice:    sp.get("max_price")   || "",
    minRating:   sp.get("min_rating")  || "",
    inStock:     sp.get("in_stock")    === "true",
    onSale:      sp.get("on_sale")     === "true",
    condition:   sp.get("condition")   || "",
    vendor:      sp.get("vendor")      || "",
    color:       sp.get("color")       || "",
    size:        sp.get("size")        || "",
  };
}

// ─── Main Catalog Content ──────────────────────────────────────────────────────
function CatalogContent() {
  const router   = useRouter();
  const sp       = useSearchParams();

  // ── State ──────────────────────────────────────────────────────────────────
  const [filters, setFilters]             = useState<ActiveFilters>(() => urlToFilters(sp));
  const [pendingFilters, setPendingFilters] = useState<ActiveFilters>(() => urlToFilters(sp));
  const [searchInput, setSearchInput]     = useState(sp.get("search") || "");
  const [search, setSearch]               = useState(sp.get("search") || "");
  const [ordering, setOrdering]           = useState(sp.get("ordering") || "-created_at");
  const [page, setPage]                   = useState(Number(sp.get("page")) || 1);
  const [gridView, setGridView]           = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [categories, setCategories]       = useState<Category[]>([]);
  const [products, setProducts]           = useState<Product[]>([]);
  const [total, setTotal]                 = useState(0);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // Track whether we're mid-debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load categories once ───────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  // ── Fetch products ─────────────────────────────────────────────────────────
  const load = useCallback(async (
    activeFilters: ActiveFilters,
    activeSearch: string,
    activeOrdering: string,
    activePage: number,
  ) => {
    setLoading(true);
    setError(null);

    const params: Record<string, string | number | boolean> = {
      page:      activePage,
      page_size: PAGE_SIZE,
      ordering:  activeOrdering,
      ...filtersToParams(activeFilters),
    };
    if (activeSearch) params.search = activeSearch;

    // Sync URL without reload
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "" && v !== false) q.set(k, String(v));
    });
    router.replace(`/buyer/catalog?${q.toString()}`, { scroll: false });

    try {
      const data = await fetchCatalog(params as Record<string, any>);
      setProducts(data.results ?? []);
      setTotal(data.count ?? 0);
    } catch (e: any) {
      const msg = e?.message || "Failed to load products";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Auto-fetch whenever primary state changes
  useEffect(() => {
    load(filters, search, ordering, page);
  }, [filters, search, ordering, page, load]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = (f: ActiveFilters) => {
    setPendingFilters(f);
    // Auto-apply on desktop (debounced)
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setFilters(f);
      setPage(1);
    }, 400);
  };

  const handleApplyFilters = () => {
    setFilters(pendingFilters);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(EMPTY_FILTERS);
    setPendingFilters(EMPTY_FILTERS);
    setSearch("");
    setSearchInput("");
    setPage(1);
  };

  const handleFilterRemove = (key: keyof ActiveFilters) => {
    const updated = { ...filters };
    if (typeof updated[key] === "boolean") (updated as any)[key] = false;
    else (updated as any)[key] = "";
    // If removing minPrice also remove maxPrice and vice-versa
    if (key === "minPrice") updated.maxPrice = "";
    if (key === "maxPrice") updated.minPrice = "";
    setFilters(updated);
    setPendingFilters(updated);
    setPage(1);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleOrderingChange = (v: string) => {
    setOrdering(v);
    setPage(1);
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const totalPages      = Math.ceil(total / PAGE_SIZE);
  const activeFilterCount = countActiveFilters(filters);
  const categoryName    = filters.category
    ? categories.find((c) => String(c.id) === filters.category)?.name
    : undefined;

  return (
    <div className="min-h-screen bg-surface">
      {/* ── Sticky Dashboard Header ── */}
      <DashboardHeader
        total={total}
        loading={loading}
        searchInput={searchInput}
        onSearchInput={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        ordering={ordering}
        onOrderingChange={handleOrderingChange}
        gridView={gridView}
        onGridView={setGridView}
        onMobileFilterOpen={() => setMobileFilterOpen(true)}
        activeFilterCount={activeFilterCount}
        categoryName={categoryName}
      />

      {/* ── Active chips bar (desktop, below header) ── */}
      {activeFilterCount > 0 && (
        <div className="max-w-[1400px] mx-auto px-4 py-2.5 bg-white border-b border-gray-100">
          <ActiveFilterChips
            filters={filters}
            categories={categories}
            onRemove={handleFilterRemove}
            onClearAll={handleReset}
          />
        </div>
      )}

      {/* ── Body: Sidebar + Grid ── */}
      <div className="max-w-[1400px] mx-auto px-4 py-6 flex gap-6 items-start">
        {/* Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          filters={pendingFilters}
          onChange={handleFilterChange}
          onApply={handleApplyFilters}
          onReset={handleReset}
          mobileOpen={mobileFilterOpen}
          onMobileClose={() => setMobileFilterOpen(false)}
        />

        {/* Main content */}
        <main className="flex-1 min-w-0" id="product-results" aria-live="polite" aria-busy={loading}>
          {/* Result count + active filter summary */}
          <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
            <p className="text-sm text-gray-500">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                  Loading products…
                </span>
              ) : (
                <>
                  <span className="font-bold text-gray-900">{total.toLocaleString()}</span>
                  {" "}product{total !== 1 ? "s" : ""} found
                  {search && <span className="text-gray-400"> for "<em>{search}</em>"</span>}
                </>
              )}
            </p>

            {/* Desktop "back to all" when filtered */}
            {(activeFilterCount > 0 || search) && !loading && (
              <button
                onClick={handleReset}
                className="hidden lg:flex items-center gap-1.5 text-xs text-trust hover:text-navy font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Show all products
              </button>
            )}
          </div>

          {/* Product grid / list */}
          <ProductGrid
            products={products}
            loading={loading}
            gridView={gridView}
            pageSize={PAGE_SIZE}
            onQuickView={setQuickViewProduct}
            onClearFilters={handleReset}
            error={error}
            onRetry={() => load(filters, search, ordering, page)}
          />

          {/* Pagination */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          )}

          {/* Page info */}
          {!loading && !error && products.length > 0 && totalPages > 1 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Page {page} of {totalPages} · {total.toLocaleString()} total products
            </p>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-surface flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CatalogContent />
    </Suspense>
  );
}
