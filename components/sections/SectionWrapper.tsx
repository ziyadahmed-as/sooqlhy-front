"use client";
import React from 'react';
import { useApprovedProducts } from '@/app/lib/hooks/useApprovedProducts';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { ShoppingCart, Star } from 'lucide-react';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';

interface SectionWrapperProps {
  title: string;
  endpoint: string;
  renderItem?: (product: Product) => React.ReactNode;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ title, endpoint, renderItem }) => {
  const { data, loading, error } = useApprovedProducts(endpoint);
  const addItem = useCartStore((state) => state.addItem);

  const defaultRender = (product: Product) => {
    const imgSrc = (() => {
      if (!product.images || product.images.length === 0) return '';
      const img = product.images[0];
      return typeof img === 'string' ? img : img?.image ?? '';
    })();
    const title = product.title ?? product.name ?? 'Product';
    const rating = product.avg_rating ?? product.average_rating ?? 0;
    const originalPrice = product.original_price;

    return (
      <div key={product.id} className="group bg-white border border-zinc-150 rounded-2xl p-3 flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all">
        <Link href={`/buyer/catalog/${product.id}`} className="block">
          <div className="relative rounded-xl overflow-hidden aspect-square bg-zinc-50 flex-shrink-0">
            {imgSrc ? (
              <img
                src={imgSrc}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-100" />
            )}
            <div className="absolute top-2 left-2 bg-[#FF4747] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
              Choice
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between mt-3">
            <h4 className="text-xs font-bold text-zinc-800 line-clamp-2 leading-tight group-hover:text-[#FF4747] transition-colors">
              {title}
            </h4>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-extrabold text-zinc-700">{Number(rating).toFixed(1)}</span>
            </div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-sm font-black text-[#FF4747]">${Number(product.price ?? 0).toFixed(2)}</span>
              {originalPrice != null && (
                <span className="text-[10px] text-zinc-400 line-through">${Number(originalPrice).toFixed(2)}</span>
              )}
            </div>
          </div>
        </Link>
        <button
          onClick={() => {
            addItem(product, 1);
            toast.success('Added to cart');
          }}
          aria-label={`Add ${title} to cart`}
          className="mt-2 p-2 rounded-xl bg-red-50 hover:bg-[#FF4747] text-[#FF4747] hover:text-white transition-colors"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-3">
          <h3 className="text-base font-extrabold text-zinc-950">{title}</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-zinc-100 animate-pulse aspect-[3/4]" />
          ))}
        </div>
      </section>
    );
  }

  if (error || !data || data.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div className="flex items-center justify-between mb-4 border-b border-zinc-200 pb-3">
        <h3 className="text-base font-extrabold text-zinc-950 flex items-center gap-2">{title}</h3>
        <Link href="/buyer/catalog" className="text-xs font-bold text-[#FF4747] hover:underline flex items-center gap-0.5">
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.map((product) => renderItem ? renderItem(product as Product) : defaultRender(product as Product))}
      </div>
    </section>
  );
};

export default SectionWrapper;
