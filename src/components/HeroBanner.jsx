import React, { useState, useEffect } from "react";
import { Play, Star, Bookmark, ChevronLeft, ChevronRight, Info } from "lucide-react";

export default function HeroBanner({
  movies = [],
  onSelectMovie,
  onWatchTrailer,
  watchlist = [],
  onToggleWatchlist
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Filter movies suitable for hero showcase
  const heroMovies = movies.filter((m) => m.featured || m.backdrop) || [];

  useEffect(() => {
    if (heroMovies.length === 0 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroMovies.length, isPaused]);

  if (heroMovies.length === 0) return null;

  const currentMovie = heroMovies[currentIndex] || heroMovies[0];
  const inWatchlist = watchlist.includes(currentMovie.imdbID);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + heroMovies.length) % heroMovies.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % heroMovies.length);
  };

  return (
    <section
      className="hero-section"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      style={{
        position: "relative",
        minHeight: "580px",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        borderBottom: "1px solid var(--border-glass)",
        background: "#080b11"
      }}
    >
      {/* Dynamic Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${currentMovie.backdrop || currentMovie.poster})`,
          backgroundSize: "cover",
          backgroundPosition: "center 25%",
          filter: "brightness(0.42) saturate(1.2)",
          transform: "scale(1.03)",
          transition: "background-image 0.8s ease, transform 10s ease"
        }}
      />

      {/* Cinematic Overlays */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to right, rgba(8, 11, 17, 0.96) 0%, rgba(8, 11, 17, 0.75) 45%, rgba(8, 11, 17, 0.3) 100%)"
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(8, 11, 17, 1) 0%, rgba(8, 11, 17, 0.2) 50%, rgba(8, 11, 17, 0.6) 100%)"
        }}
      />

      {/* Content Container */}
      <div
        className="container"
        style={{
          position: "relative",
          zIndex: 10,
          paddingTop: "4rem",
          paddingBottom: "4rem",
          width: "100%"
        }}
      >
        <div style={{ maxWidth: "750px" }}>
          {/* Tagline / Subheading */}
          {currentMovie.tagline && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.85rem",
                color: "var(--accent-gold)",
                fontWeight: 600,
                fontSize: "0.9rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase"
              }}
            >
              <span style={{ width: "24px", height: "2px", background: "var(--accent-gold)" }} />
              {currentMovie.tagline}
            </div>
          )}

          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(2.5rem, 5vw, 4.2rem)",
              fontWeight: 900,
              lineHeight: 1.08,
              letterSpacing: "-0.03em",
              marginBottom: "1rem",
              color: "#ffffff",
              textShadow: "0 4px 24px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0, 0, 0, 0.9)"
            }}
          >
            {currentMovie.title}
          </h1>

          {/* Metadata Chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "1.25rem"
            }}
          >
            {/* IMDb Rating Badge */}
            <div
              className="badge badge-gold"
              style={{ padding: "0.35rem 0.75rem", fontSize: "0.85rem" }}
            >
              <Star size={14} fill="#fbbf24" strokeWidth={0} />
              <span>IMDb {currentMovie.imdbRating || "8.5"}</span>
            </div>

            <span
              className="badge"
              style={{
                background: "rgba(0, 0, 0, 0.65)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.25)"
              }}
            >
              {currentMovie.year}
            </span>
            {currentMovie.rated && (
              <span
                className="badge"
                style={{
                  background: "rgba(0, 0, 0, 0.65)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.25)"
                }}
              >
                {currentMovie.rated}
              </span>
            )}
            {currentMovie.runtime && (
              <span
                className="badge"
                style={{
                  background: "rgba(0, 0, 0, 0.65)",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.25)"
                }}
              >
                {currentMovie.runtime}
              </span>
            )}

            {currentMovie.genre &&
              currentMovie.genre
                .split(",")
                .slice(0, 2)
                .map((g) => (
                  <span key={g.trim()} className="badge badge-cyan">
                    {g.trim()}
                  </span>
                ))}
          </div>

          {/* Synopsis */}
          <p
            style={{
              fontSize: "1.05rem",
              lineHeight: 1.65,
              color: "rgba(255, 255, 255, 0.95)",
              marginBottom: "2rem",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textShadow: "0 2px 12px rgba(0, 0, 0, 0.85)"
            }}
          >
            {currentMovie.plot}
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "1rem"
            }}
          >
            <button
              onClick={() => onWatchTrailer(currentMovie)}
              className="btn btn-crimson"
              style={{ padding: "0.8rem 1.6rem", fontSize: "1rem" }}
            >
              <Play size={18} fill="#ffffff" />
              Watch Trailer
            </button>

            <button
              onClick={() => onSelectMovie(currentMovie)}
              className="btn btn-secondary"
              style={{ padding: "0.8rem 1.5rem", fontSize: "0.95rem" }}
            >
              <Info size={18} />
              Details & Rate
            </button>

            <button
              onClick={() => onToggleWatchlist(currentMovie)}
              aria-label="Add to Watch Later"
              className="btn btn-secondary"
              style={{
                padding: "0.8rem 1.25rem",
                color: inWatchlist ? "var(--accent-cyan)" : "var(--text-primary)",
                borderColor: inWatchlist ? "var(--accent-cyan)" : "var(--border-glass)",
                background: inWatchlist ? "rgba(6, 182, 212, 0.15)" : undefined
              }}
            >
              <Bookmark
                size={18}
                fill={inWatchlist ? "var(--accent-cyan)" : "none"}
                color={inWatchlist ? "var(--accent-cyan)" : "currentColor"}
              />
              <span>{inWatchlist ? "In Watch Later" : "Watch Later"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrev}
        aria-label="Previous movie"
        className="btn-icon"
        style={{
          position: "absolute",
          left: "1.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.15)"
        }}
      >
        <ChevronLeft size={22} />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next movie"
        className="btn-icon"
        style={{
          position: "absolute",
          right: "1.5rem",
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 20,
          background: "rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.15)"
        }}
      >
        <ChevronRight size={22} />
      </button>

      {/* Slide Indicators */}
      <div
        style={{
          position: "absolute",
          bottom: "1.5rem",
          right: "2rem",
          zIndex: 20,
          display: "flex",
          gap: "0.5rem"
        }}
      >
        {heroMovies.map((m, idx) => (
          <button
            key={m.imdbID || idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            style={{
              width: idx === currentIndex ? "28px" : "8px",
              height: "8px",
              borderRadius: "4px",
              background: idx === currentIndex ? "var(--accent-gold)" : "rgba(255,255,255,0.25)",
              transition: "all 0.3s ease",
              border: "none",
              cursor: "pointer",
              padding: 0
            }}
          />
        ))}
      </div>
    </section>
  );
}
