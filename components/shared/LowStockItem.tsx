// src/components/shared/LowStockItem.tsx
"use client";
import type { VendorProduct } from '@/lib/types';
import styles from '@/styles/components.module.css';

export default function LowStockItem({ product }: { product: VendorProduct }) {
  return (
    <div className={styles.lowStockItem}>
      <p className={styles.lowStockTitle}>{product.title}</p>
      <p className={styles.lowStockQty}>Only {product.stock} left!</p>
    </div>
  );
}
