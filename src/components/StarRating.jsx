import React, { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({
  rating = 0,
  maxStars = 10,
  onRate,
  readOnly = false,
  size = 20,
  showLabel = true
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = hoverRating || rating;

  const getScoreLabel = (score) => {
    if (!score) return "Not rated yet";
    if (score <= 2) return "Poor";
    if (score <= 4) return "Below Average";
    if (score <= 6) return "Good";
    if (score <= 7) return "Very Good";
    if (score <= 8) return "Great";
    if (score <= 9) return "Amazing";
    return "Masterpiece!";
  };

  return (
    <div className="star-rating-container" style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem" }}>
      <div
        className="stars-row"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "3px",
          cursor: readOnly ? "default" : "pointer"
        }}
        onMouseLeave={() => !readOnly && setHoverRating(0)}
      >
        {Array.from({ length: maxStars }, (_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= activeRating;

          return (
            <button
              type="button"
              key={starValue}
              disabled={readOnly}
              onClick={() => onRate && onRate(starValue)}
              onMouseEnter={() => !readOnly && setHoverRating(starValue)}
              aria-label={`Rate ${starValue} of ${maxStars}`}
              style={{
                background: "transparent",
                border: "none",
                padding: "2px",
                cursor: readOnly ? "default" : "pointer",
                transition: "transform 0.15s ease",
                transform: !readOnly && hoverRating === starValue ? "scale(1.25)" : "scale(1)"
              }}
            >
              <Star
                size={size}
                strokeWidth={1.5}
                color={isFilled ? "#f59e0b" : "rgba(255, 255, 255, 0.25)"}
                fill={isFilled ? "#f59e0b" : "transparent"}
                style={{
                  filter: isFilled ? "drop-shadow(0 0 6px rgba(245, 158, 11, 0.45))" : "none",
                  transition: "all 0.15s ease"
                }}
              />
            </button>
          );
        })}
      </div>

      {showLabel && (
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
          <span style={{ fontWeight: "700", color: activeRating > 0 ? "#f59e0b" : "var(--text-muted)", fontSize: "0.95rem" }}>
            {activeRating > 0 ? `${activeRating}/10` : "0/10"}
          </span>
          <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
            ({getScoreLabel(activeRating)})
          </span>
        </div>
      )}
    </div>
  );
}
