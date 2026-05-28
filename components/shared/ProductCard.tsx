
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import StarRating from '@/components/shared/StarRating';
import styles from '@/styles/components.module.css';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/buyer/catalog/${product.id}`} className={styles.card}>
      <Image
        src={product.images[0]}
        alt={product.title}
        width={400}
        height={300}
        className={styles.image}
        priority
      />
      <div className={styles.info}>
        <h3 className={styles.title}>{product.title}</h3>
        <p className={styles.vendor}>
          {product.vendor.name}
          {product.vendor.is_verified && (
            <span className={styles.verifiedBadge}>✔️ Verified</span>
          )}
        </p>
        <StarRating rating={product.avg_rating} />
        <p className={styles.price}>${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
