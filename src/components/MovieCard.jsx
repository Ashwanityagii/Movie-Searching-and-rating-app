import React, { useState } from "react";
import { Star, Bookmark, Play, Heart, Film } from "lucide-react";

export default function MovieCard({
  movie,
  userRating,
  inWatchlist,
  isFavorite,
  onSelectMovie,
  onToggleWatchlist,
  onToggleFavorite,
  onWatchTrailer
}) {
  const [imgError, setImgError] = useState(false);

  const fallbackPoster =
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80";

  const posterSrc =
    !imgError && movie.poster && movie.poster !== "N/A" ? movie.poster : fallbackPoster;

  return (
    <div
      className="movie-card"
      onClick={() => onSelectMovie(movie)}
      style={{
        position: "relative",
        borderRadius: "var(--radius-md)",
        background: "var(--bg-card)",
        border: "1px solid var(--border-glass)",
        overflow: "hidden",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.3s cubic-bezier(0.2, 0, 0, 1), border-color 0.3s ease, box-shadow 0.3s ease"
      }}
    >
      {/* Poster Image Container */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingTop: "148%", // Standard cinematic poster aspect ratio (approx 2:3)
          backgroundColor: "#0d111a",
          overflow: "hidden"
        }}
      >
        <img
          src={posterSrc}
          alt={movie.title}
          loading="lazy"
          onError={() => setImgError(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease"
          }}
          className="poster-img"
        />

        {/* Gradient vignette */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(14, 18, 28, 0.95) 0%, rgba(14, 18, 28, 0.2) 50%, rgba(14, 18, 28, 0.4) 100%)"
          }}
        />

        {/* Top Badges */}
        <div
          style={{
            position: "absolute",
            top: "0.75rem",
            left: "0.75rem",
            right: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            zIndex: 5
          }}
        >
          {/* Rating Badge */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div
              className="badge badge-gold"
              style={{
                background: "rgba(10, 13, 20, 0.85)",
                backdropFilter: "blur(8px)",
                padding: "0.3rem 0.6rem"
              }}
            >
              <Star size={13} fill="#f59e0b" strokeWidth={0} />
              <span>{movie.imdbRating && movie.imdbRating !== "N/A" ? movie.imdbRating : "7.5"}</span>
            </div>

            {userRating && (
              <div
                className="badge badge-crimson"
                title={`You rated this ${userRating}/10`}
                style={{
                  background: "rgba(225, 29, 72, 0.9)",
                  color: "#fff",
                  padding: "0.2rem 0.5rem",
                  fontSize: "0.7rem",
                  fontWeight: 700
                }}
              >
                ★ You: {userRating}/10
              </div>
            )}
          </div>

          {/* Quick Action Buttons (Favorite & Watchlist) */}
          <div style={{ display: "flex", gap: "0.35rem" }}>
            <button
              type="button"
              aria-label="Add to favorites"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(movie.imdbID);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-full)",
                background: "rgba(10, 13, 20, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--border-glass)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isFavorite ? "#f43f5e" : "#cbd5e1"
              }}
            >
              <Heart
                size={16}
                fill={isFavorite ? "#f43f5e" : "none"}
                color={isFavorite ? "#f43f5e" : "currentColor"}
              />
            </button>

            <button
              type="button"
              aria-label="Add to watchlist"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(movie.imdbID);
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: "var(--radius-full)",
                background: "rgba(10, 13, 20, 0.8)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--border-glass)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: inWatchlist ? "var(--accent-cyan)" : "#cbd5e1"
              }}
            >
              <Bookmark
                size={16}
                fill={inWatchlist ? "var(--accent-cyan)" : "none"}
                color={inWatchlist ? "var(--accent-cyan)" : "currentColor"}
              />
            </button>
          </div>
        </div>

        {/* Hover Trailer Play Button */}
        <div
          className="card-play-overlay"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0,
            transition: "opacity 0.25s ease",
            background: "rgba(8, 11, 17, 0.45)"
          }}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onWatchTrailer(movie);
            }}
            className="btn btn-crimson"
            style={{
              padding: "0.6rem 1rem",
              fontSize: "0.85rem",
              borderRadius: "var(--radius-full)",
              transform: "scale(0.9)",
              transition: "transform 0.2s ease"
            }}
          >
            <Play size={15} fill="#ffffff" />
            Watch Trailer
          </button>
        </div>
      </div>

      {/* Card Info Section */}
      <div
        style={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
          flexGrow: 1,
          justifyContent: "space-between"
        }}
      >
        <div>
          <h3
            title={movie.title}
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: "0.35rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
          >
            {movie.title}
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "0.8rem",
              color: "var(--text-muted)"
            }}
          >
            <span>{movie.year || "N/A"}</span>
            {movie.runtime && movie.runtime !== "N/A" && <span>{movie.runtime}</span>}
          </div>
        </div>

        {/* Genre Tags */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem",
            marginTop: "0.5rem"
          }}
        >
          {(movie.genre || "Cinema")
            .split(",")
            .slice(0, 2)
            .map((g) => (
              <span
                key={g.trim()}
                style={{
                  fontSize: "0.7rem",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-glass)"
                }}
              >
                {g.trim()}
              </span>
            ))}
        </div>
      </div>

      <style>{`
        .movie-card:hover {
          transform: translateY(-6px);
          border-color: rgba(245, 158, 11, 0.35);
          box-shadow: 0 15px 30px -8px rgba(0, 0, 0, 0.8), 0 0 15px rgba(245, 158, 11, 0.15);
        }
        .movie-card:hover .poster-img {
          transform: scale(1.06);
        }
        .movie-card:hover .card-play-overlay {
          opacity: 1;
        }
        .movie-card:hover .card-play-overlay button {
          transform: scale(1);
        }
      `}</style>
    </div>
  );
}
