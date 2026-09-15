import React from "react";
import { Bookmark, Star, Clapperboard, Trash2, ArrowRight } from "lucide-react";
import MovieCard from "./MovieCard";

export default function WatchlistView({
  type = "watchlist", // "watchlist" or "myRatings"
  movies = [],
  userRatings = {},
  watchlist = [],
  favorites = [],
  onSelectMovie,
  onToggleWatchlist,
  onToggleFavorite,
  onWatchTrailer,
  onExploreClick
}) {
  const isWatchlist = type === "watchlist";

  // Filter movies that match either watchlist or rated
  const displayedMovies = movies.filter((m) => {
    if (isWatchlist) {
      return watchlist.includes(m.imdbID);
    } else {
      return userRatings[m.imdbID] !== undefined;
    }
  });

  // Calculate statistics for user ratings
  const ratedKeys = Object.keys(userRatings);
  const averageRatingGiven =
    ratedKeys.length > 0
      ? (
          ratedKeys.reduce((acc, id) => acc + (userRatings[id]?.rating || 0), 0) /
          ratedKeys.length
        ).toFixed(1)
      : null;

  return (
    <div className="container" style={{ paddingBottom: "4rem" }}>
      {/* View Header */}
      <div
        className="glass-panel"
        style={{
          padding: "2rem",
          marginBottom: "2.5rem",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1.5rem"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-md)",
              background: isWatchlist
                ? "rgba(6, 182, 212, 0.15)"
                : "rgba(245, 158, 11, 0.15)",
              color: isWatchlist ? "var(--accent-cyan)" : "var(--accent-gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {isWatchlist ? <Bookmark size={26} /> : <Clapperboard size={26} />}
          </div>
          <div>
            <h1 style={{ fontSize: "1.8rem", margin: 0 }}>
              {isWatchlist ? "My Watchlist" : "My Rated Movies"}
            </h1>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "4px" }}>
              {isWatchlist
                ? "Movies and cinema you have bookmarked to enjoy later."
                : "Films you have personally reviewed and rated on CinemaSathi."}
            </p>
          </div>
        </div>

        {/* Stats Pill */}
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <div
            style={{
              padding: "0.6rem 1.2rem",
              borderRadius: "var(--radius-md)",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid var(--border-glass)",
              textAlign: "center"
            }}
          >
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--text-primary)" }}>
              {displayedMovies.length}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
              Total Movies
            </div>
          </div>

          {!isWatchlist && averageRatingGiven && (
            <div
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: "var(--radius-md)",
                background: "rgba(245, 158, 11, 0.1)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
                textAlign: "center"
              }}
            >
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "var(--accent-gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "4px"
                }}
              >
                <Star size={16} fill="var(--accent-gold)" />
                {averageRatingGiven}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                Avg Rating Given
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movies Grid or Empty State */}
      {displayedMovies.length === 0 ? (
        <div
          className="glass-panel"
          style={{
            padding: "4rem 2rem",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1.25rem"
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-full)",
              background: "rgba(255, 255, 255, 0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-muted)"
            }}
          >
            {isWatchlist ? <Bookmark size={32} /> : <Star size={32} />}
          </div>

          <h3 style={{ fontSize: "1.4rem", margin: 0 }}>
            {isWatchlist
              ? "Your watchlist is empty"
              : "You haven't rated any movies yet"}
          </h3>

          <p style={{ maxWidth: "460px", color: "var(--text-secondary)", margin: 0 }}>
            {isWatchlist
              ? "Discover blockbusters and timeless classics, click the bookmark icon on any movie card to build your personalized watchlist."
              : "Browse any movie, click into details, and assign your personal 10-star rating to track what you have seen."}
          </p>

          <button onClick={onExploreClick} className="btn btn-primary" style={{ marginTop: "0.5rem" }}>
            Explore All Movies
            <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: "1.5rem"
          }}
        >
          {displayedMovies.map((movie) => (
            <MovieCard
              key={movie.imdbID}
              movie={movie}
              userRating={userRatings[movie.imdbID]?.rating}
              inWatchlist={watchlist.includes(movie.imdbID)}
              isFavorite={favorites.includes(movie.imdbID)}
              onSelectMovie={onSelectMovie}
              onToggleWatchlist={onToggleWatchlist}
              onToggleFavorite={onToggleFavorite}
              onWatchTrailer={onWatchTrailer}
            />
          ))}
        </div>
      )}
    </div>
  );
}
