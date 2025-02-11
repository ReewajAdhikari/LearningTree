import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';

const RatingStars = ({ initialRating = 0, onRate, readonly = false }) => {
  const [hover, setHover] = useState(null);
  const [rating, setRating] = useState(initialRating);

  const handleRating = (currentRating) => {
    if (!readonly) {
      setRating(currentRating);
      if (onRate) onRate(currentRating);
    }
  };

  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <FaStar
            key={index}
            className={`cursor-pointer ${readonly ? '' : 'transition-colors duration-200'}`}
            color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
            size={20}
            onClick={() => handleRating(ratingValue)}
            onMouseEnter={() => !readonly && setHover(ratingValue)}
            onMouseLeave={() => !readonly && setHover(null)}
          />
        );
      })}
    </div>
  );
};

export default RatingStars;