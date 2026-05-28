import Image from 'next/image';
import { useState } from 'react';
import styles from '@/styles/components.module.css';

type Props = {
  images: string[];
  alt?: string;
};

export default function ImageGallery({ images, alt = 'Product image' }: Props) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  if (!images || images.length === 0) return null;
  return (
    <div className={styles.gallery}>
      <div className={styles.mainImage}>
        <Image src={images[selectedIdx]} alt={alt} width={600} height={400} priority />
      </div>
      <div className={styles.thumbnails}>
        {images.map((src, idx) => (
          <button
            key={src}
            className={`${styles.thumbnail} ${idx === selectedIdx ? styles.active : ''}`}
            onClick={() => setSelectedIdx(idx)}
          >
            <Image src={src} alt={alt + ' thumbnail'} width={100} height={80} />
          </button>
        ))}
      </div>
    </div>
  );
}
