

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchCatalog, fetchCategories } from "@/lib/api/catalog";
import { Product, Category } from "@/lib/types";
import ProductCard from "@/components/shared/ProductCard";
import styles from "@/styles/catalog.module.css";
import Head from "next/head";

export async function generateMetadata() {
  return {
    title: "Sooqly Marketplace – Catalog",
    description: "Browse premium products from multiple vendors. Filter by category, price, and rating.",
  };
}

export default function CatalogPage() {
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

  // Load categories once
  useEffect(() => {
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
    (async () => {
      const data = await fetchCatalog(buildParams());
      setProducts(data.results);
      setTotal(data.count);
      setLoading(false);
    })();
    // Update URL to reflect current filters
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
            <p className="col-span-full text-center">Loading…</p>
          ) : products.length === 0 ? (
            <p className="col-span-full text-center">No products match your filters.</p>
          ) : (
            products.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </div>
      </div>
      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          className={styles.pageBtn}
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page <= 1}
        >
          Previous
        </button>
        <span className="text-white">Page {page} of {totalPages}</span>
        <button
          className={styles.pageBtn}
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </>
  );
}
