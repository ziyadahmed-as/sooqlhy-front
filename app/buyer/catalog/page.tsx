"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCatalog, fetchCategories } from "@/lib/api/catalog";
import { Product, Category } from "@/lib/types";
import ProductCard from "@/components/shared/ProductCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Pagination } from "@/components/shared/Pagination";
import styles from "@/styles/catalog.module.css";


function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter state – stored in URL search params for shareability
  const [category, setCategory] = useState<string>(searchParams.get("category") || "");
  const [minPrice, setMinPrice] = useState<string>(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState<string>(searchParams.get("max_price") || "");
  const [rating, setRating] = useState<string>(searchParams.get("rating") || "");
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 1);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    document.title = "Sooqly Marketplace – Catalog";
    (async () => {
      const cats = await fetchCategories();
      setCategories(cats);
    })();
  }, []);

  // Build query params object for catalog API
  const buildParams = () => {
    const p: Record<string, string | number> = { page };
    if (category) p.category = category;
    if (minPrice) p.min_price = Number(minPrice);
    if (maxPrice) p.max_price = Number(maxPrice);
    if (rating) p.rating = Number(rating);
    return p;
  };

  // Sync URL when any filter changes
  const syncUrl = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (rating) params.set("rating", rating);
    if (page > 1) params.set("page", String(page));
    router.replace(`/buyer/catalog?${params.toString()}`);
  };

  // Fetch products whenever search params (or page) change
  useEffect(() => {
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await fetchCatalog(buildParams());
        setProducts(data.results);
        setTotal(data.count);
      } catch (err: unknown) {
        setError((err as any)?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
    syncUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, minPrice, maxPrice, rating, page]);

  // Handlers for UI controls
  const handleCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1);
  };
  const handleMinPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
    setPage(1);
  };
  const handleMaxPrice = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
    setPage(1);
  };
  const handleRating = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRating(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / 12); // assuming 12 per page

  return (
    <>
      <Head>
        <title>Sooqly Marketplace – Catalog</title>
        <meta name="description" content="Browse premium products from multiple vendors." />
      </Head>
      <div className={styles.pageWrapper}>
        <div className={styles.sidebar}>
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          {/* Category filter */}
          <label className={styles.filterLabel}>Category</label>
          <select
            value={category}
            onChange={handleCategory}
            className="w-full rounded p-2 mb-4 bg-white text-black"
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {/* Price range */}
          <label className={styles.filterLabel}>Price range</label>
          <div className="flex gap-2 mb-4">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={handleMinPrice}
              className="w-1/2 rounded p-2 bg-white text-black"
            />
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={handleMaxPrice}
              className="w-1/2 rounded p-2 bg-white text-black"
            />
          </div>
          {/* Rating filter */}
          <label className={styles.filterLabel}>Minimum rating</label>
          <select
            value={rating}
            onChange={handleRating}
            className="w-full rounded p-2 mb-4 bg-white text-black"
          >
            <option value="">Any</option>
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>
                {r} ★ & up
              </option>
            ))}
          </select>
        </div>
        <div className={styles.grid}>
          {loading ? (
            <div className="col-span-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-gray-200 bg-white overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="col-span-full">
              <ErrorState message={error} />
            </div>
          ) : products.length === 0 ? (
            <div className="col-span-full">
              <EmptyState title="No products found" description="Try adjusting your filters." />
            </div>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </div>
      {/* Pagination */}
      <div className="flex justify-center py-4">
        <Pagination page={page} totalPages={Math.max(1, Math.ceil(total / 12))} onPageChange={setPage} />
      </div>
    </>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<p style={{ textAlign: "center", color: "#fff", padding: "4rem" }}>Loading Catalog…</p>}>
      <CatalogContent />
    </Suspense>
  );
}
