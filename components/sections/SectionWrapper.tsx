import React from 'react';
import { useApprovedProducts } from '@/app/lib/hooks/useApprovedProducts';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ShoppingCart, Star } from 'lucide-react';

interface SectionWrapperProps {
  title: string;
  endpoint: string; // API endpoint to fetch products
  renderItem?: (product: Product) => React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, endpoint, renderItem }) => {
  const { data, loading, error } = useApprovedProducts(endpoint);

  const defaultRender = (product: Product) => (
    <Link
      key={product.id}
      href={`/buyer/catalog/${product.id}`}
      className="group bg-white border border-zinc-150 rounded-2xl p-3 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all"
    >
      <div className="relative rounded-xl overflow-hidden aspect-square bg-zinc-50 flex-shrink-0">
        <img
          src={product.images?.[0] ?? product.image ?? ''}
          alt={product.title ?? product.name ?? 'Product'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 left-2 bg-[#FF4747] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
          Choice
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between mt-3">
        <h4 className="text-xs font-bold text-zinc-800 line-clamp-2 leading-tight group-hover:text-[#FF4747] transition-colors">
          {product.title ?? product.name}
        </h4>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center text-yellow-400">
            <Star className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-[10px] font-extrabold text-zinc-700">
            {product.avg_rating ?? product.rating ?? 0}
          </span>
        </div>
        <div className="flex items-baseline gap-1.5 mt-2">
          <span className="text-sm font-black text-[#FF4747]">
            ${product.price?.toFixed(2) ?? '0.00'}
          </span>
          {product.original_price && (
            <span className="text-[10px] text-zinc-400 line-through">
              ${product.original_price?.toFixed(2)}
            </span>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            // Placeholder addToCart logic; should be wired to actual cart API
          }}
          className="mt-2 p-2 rounded-xl bg-red-50 hover:bg-[#FF4747] text-[#FF4747] hover:text-white transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </Link>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-3">
        <h3 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">
          {title}
        </h3>
        <Link href="/buyer/catalog" className="text-xs font-bold text-[#FF4747] hover:underline flex items-center gap-0.5">
          View All <span className="ml-0.5">→</span>
        </Link>
      </div>
      {loading && <p className="text-sm text-zinc-500">Loading...</p>}
      {error && <p className="text-sm text-red-600">Error loading products.</p>}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data && data.map((product) => (renderItem ? renderItem(product as Product) : defaultRender(product as Product)))}
      </div>
    </section>
  );
};

export default SectionWrapper;
