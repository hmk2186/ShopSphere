import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating = 0, count, size = 15, showValue = true }) => {
  const rounded = Math.round(Number(rating) * 10) / 10;

  return (
    <div className="d-inline-flex align-items-center gap-1">
      <div className="d-flex align-items-center" style={{ color: 'var(--color-secondary)' }}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= Math.round(rating);
          return (
            <Star
              key={starIndex}
              size={size}
              fill={isFilled ? 'var(--color-secondary)' : 'none'}
              stroke="var(--color-secondary)"
              strokeWidth={1.8}
            />
          );
        })}
      </div>
      {showValue && (
        <span
          className="ms-1 fw-bold"
          style={{ fontSize: `${size * 0.9}px`, color: 'var(--text-primary)' }}
        >
          {rounded.toFixed(1)}
        </span>
      )}
      {count !== undefined && (
        <span
          className="text-muted ms-1"
          style={{ fontSize: `${size * 0.85}px` }}
        >
          ({count})
        </span>
      )}
    </div>
  );
};

export default RatingStars;
