"use client";
import { useState } from 'react';
import styles from '@/styles/components.module.css';

type Props = {
  rating: number; // 0‑5 (can be fractional)
  interactive?: boolean;
  onChange?: (rating: number) => void;
};

export default function StarRating({ rating, interactive = false, onChange }: Props) {
  const [tempRating, setTempRating] = useState<number | null>(null);
  const displayRating = tempRating ?? rating;

  const handleHover = (value: number) => {
    if (interactive) setTempRating(value);
  };
  const handleLeave = () => {
    if (interactive) setTempRating(null);
  };
  const handleClick = (value: number) => {
    if (interactive && onChange) onChange(value);
  };

  const stars = Array.from({ length: 5 }, (_, i) => i + 1);

  return (
    <div className={styles.starRow}>
      {stars.map(star => {
        const filled = displayRating >= star;
        const half = displayRating > star - 1 && displayRating < star;
        return (
          <svg
            key={star}
            viewBox="0 0 20 20"
            className={filled ? styles.star : styles.starEmpty}
            width={20}
            height={20}
            onMouseEnter={() => handleHover(star)}
            onMouseLeave={handleLeave}
            onClick={() => handleClick(star)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
          >
            <path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.564-.955L10 0l2.948 5.955 6.564.955-4.756 4.635 1.122 6.545z" />
          </svg>
        );
      })}
    </div>
  );
}
