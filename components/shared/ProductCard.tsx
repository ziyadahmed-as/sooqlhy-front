
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import StarRating from '@/components/shared/StarRating';
import styles from '@/styles/components.module.css';

export default function ProductCard({ product }: { product: Product }) {
  const title = product.title || product.name || 'Unnamed Product';
  const imgUrl = (Array.isArray(product.images) && product.images.length > 0)
    ? (typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.image)
    : '/placeholder.jpg';
  const rating = product.avg_rating || product.average_rating || 0;
  const vendorName = product.vendor?.name || 'Unknown Vendor';
  const isVerified = product.vendor?.is_verified || false;
  const price = product.price ?? 0;

  return (
    <Link href={`/buyer/catalog/${product.id}`} className={styles.card}>
      <Image
        src={imgUrl || '/placeholder.jpg'}
        alt={title}
        width={400}
        height={300}
        className={styles.image}
        priority
      />
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.vendor}>
          {vendorName}
          {isVerified && (
            <span className={styles.verifiedBadge}>✔️ Verified</span>
          )}
        </p>
        <StarRating rating={rating} />
        <p className={styles.price}>${price.toFixed(2)}</p>
      </div>
    </Link>
  );
}
