// components/shared/ReviewList.tsx
"use client";

import { FC } from "react";
import { Review } from "@/lib/types";
import styles from "@/styles/components.module.css";

/**
 * Simple list of product reviews.
 * It expects an array of {@link Review} objects with at least `rating`, `author` and `comment` fields.
 * If the `Review` type does not exist in the project, it will be treated as `any` – the component will still compile.
 */
const ReviewList: FC<{ reviews: Review[] }> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <p className={styles.emptyState}>No reviews yet.</p>;
  }

  return (
    <div className={styles.reviewList}>
      {reviews.map((review) => (
        <div key={review.id} className={styles.reviewItem + " bg-white/5 backdrop-blur-sm p-4 rounded-lg mb-4"}>
          <div className={styles.reviewHeader + " flex justify-between items-center mb-2"}>
            <span className={styles.reviewAuthor}>{review.author}</span>
            <span className={styles.reviewRating}>⭐ {review.rating}/5</span>
          </div>
          <p className={styles.reviewComment}>{review.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
